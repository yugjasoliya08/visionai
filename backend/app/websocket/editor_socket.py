from fastapi import WebSocket, APIRouter, WebSocketDisconnect, Query, status
from app.websocket.connection_manager import manager
from app.database.connection import SessionLocal
from app.services.ot_service import transform
from app.models.document import Document
from app.models.user import User, ChatMessage, DocumentHistory
from app.services.snapshot_service import save_snapshot, get_latest_snapshot
from app.core.security import verify_token
from app.services.permission_service import get_user_role
import json
import asyncio
from collections import deque
from datetime import datetime

router = APIRouter()


document_versions   = {}
operation_queues    = {}
document_locks      = {}
operation_history   = {}
document_snapshots  = {}
operation_counters  = {}
document_languages  = {}
socket_username_map = {}   

shared_file_store   = {}  
MAX_HISTORY       = 50
SNAPSHOT_INTERVAL = 5

def background_save(doc_id_int: int, content: str, language: str = None):
    db = SessionLocal()
    try:
        main_doc = db.query(Document).filter(Document.id == doc_id_int).first()
        if main_doc:
            main_doc.content    = content
            main_doc.updated_at = datetime.utcnow()
            if language:
                main_doc.language = language
        save_snapshot(db, doc_id_int, content)
        db.add(DocumentHistory(
            document_id=doc_id_int,
            content=content,
            timestamp=datetime.utcnow(),
        ))  
        db.commit()
        print(f"✅ DB SYNC: Doc {doc_id_int} saved")
    except Exception as e:
        print(f"🚨 DB save error: {e}")
        db.rollback()
    finally:
        db.close()

def hydrate_document_state(db, doc_id_str: str):
    """Initializes in-memory state for a document if not already present."""
    if doc_id_str not in document_versions:
        document_versions[doc_id_str]  = 0
        operation_queues[doc_id_str]   = deque()
        document_locks[doc_id_str]     = asyncio.Lock()
        operation_history[doc_id_str]  = deque(maxlen=MAX_HISTORY)

        snap = get_latest_snapshot(db, int(doc_id_str))
        if snap:
            document_snapshots[doc_id_str] = snap.content or ""
        else:
            main_doc = db.query(Document).filter(Document.id == int(doc_id_str)).first()
            document_snapshots[doc_id_str] = (main_doc.content or "") if main_doc else ""

        main_doc = db.query(Document).filter(Document.id == int(doc_id_str)).first()
        document_languages[doc_id_str] = (main_doc.language if main_doc and main_doc.language else "python")

async def send_to_user(doc_id: str, target_username: str, message: dict):
    if doc_id not in manager.active_connections:
        return
    for ws in manager.active_connections[doc_id]:
        if socket_username_map.get(ws) == target_username:
            try:
                await ws.send_json(message)
            except Exception:
                pass
            break
        
async def process_queue(doc_id: str, websocket: WebSocket, username: str):
    if doc_id not in document_locks:
        document_locks[doc_id] = asyncio.Lock()

    async with document_locks[doc_id]:
        queue = operation_queues[doc_id]
        while queue:
            message        = queue.popleft()
            client_version = message.get("version", 0)
            server_version = document_versions.get(doc_id, 0)

            if client_version < server_version:
                missed = [op for op in operation_history[doc_id]
                          if op.get("version", 0) >= client_version]
                for prev_op in missed:
                    message = transform(prev_op, message)

            if message.get("ignore"):
                continue

            message["version"] = server_version + 1
            operation_history[doc_id].append(message)
            document_versions[doc_id] += 1

            curr = document_snapshots.get(doc_id, "")
            op   = message.get("operation")

            if op == "insert":
                pos  = message.get("position", 0)
                val  = message.get("value", "")
                curr = curr[:pos] + val + curr[pos:]
            elif op == "delete":
                pos  = message.get("position", 0)
                dl   = message.get("length", 1)
                curr = curr[:pos] + curr[pos + dl:]
            elif op == "replace":
                curr = message.get("value", "")

            document_snapshots[doc_id] = curr
            operation_counters[doc_id] = operation_counters.get(doc_id, 0) + 1

            if operation_counters[doc_id] >= SNAPSHOT_INTERVAL:
                operation_counters[doc_id] = 0
                lang = document_languages.get(doc_id)
                asyncio.create_task(asyncio.to_thread(background_save, int(doc_id), curr, lang))

            await manager.broadcast(message, doc_id, exclude=websocket)

async def broadcast_user_list(doc_id: str):
    """Sends the current list of active usernames to everyone in the room."""
    usernames = []
    if doc_id in manager.active_connections:
        for ws in manager.active_connections[doc_id]:
            name = socket_username_map.get(ws)
            if name:
                usernames.append(name)
            
    unique_users = list(set(usernames))
    await manager.broadcast({
        "type":  "user_list_update",
        "users": unique_users,
        "count": len(unique_users),
    }, doc_id)

@router.websocket("/ws/{doc_id}/{username}")
async def websocket_endpoint(
    websocket: WebSocket,
    doc_id:    str,
    username:  str,
    token:     str = Query(None),
):
    try:
        token_username = verify_token(token)
        if not token_username or str(token_username) != str(username):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db = SessionLocal()
    current_active_doc = doc_id

    try:
        db_user = db.query(User).filter(User.username == username).first()
        if not db_user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(websocket, current_active_doc, username)
        socket_username_map[websocket] = username

        
        hydrate_document_state(db, current_active_doc)

        
        await websocket.send_json({
            "type":     "snapshot",
            "content":  document_snapshots[current_active_doc],
            "version":  document_versions[current_active_doc],
            "language": document_languages.get(current_active_doc, "python"),
        })

        existing_files = {
            k.split("::", 1)[1]: v
            for k, v in shared_file_store.items()
            if k.startswith(f"{current_active_doc}::")
        }
        if existing_files:
            await websocket.send_json({
                "type":  "shared_files_init",
                "files": [
                    {"filename": fname, "content": content}
                    for fname, content in existing_files.items()
                ],
            })

       
        await broadcast_user_list(current_active_doc)

        while True:
            data  = await websocket.receive_text()
            msg   = json.loads(data)
            mtype = msg.get("type")

            if mtype == "operation":
             
                active_file = msg.get("active_file", "")
                if not active_file or active_file.startswith("main."):
                    operation_queues[current_active_doc].append(msg)
                    await process_queue(current_active_doc, websocket, username)
                
            elif mtype == "switch_file":
                new_doc_id = str(msg.get("doc_id"))
                manager.disconnect(current_active_doc, websocket)
                await broadcast_user_list(current_active_doc)  
                await manager.connect(websocket, new_doc_id, username)
                current_active_doc = new_doc_id
                hydrate_document_state(db, current_active_doc)
                await broadcast_user_list(current_active_doc)  
                await websocket.send_json({
                    "type":     "snapshot",
                    "content":  document_snapshots[current_active_doc],
                    "version":  document_versions[current_active_doc],
                    "language": document_languages.get(current_active_doc, "python"),
                })

            
            elif mtype == "file_created":
                fname   = msg.get("filename", "")
                content = msg.get("content", "")
                size    = msg.get("size", 0)
                if fname:
                 
                    shared_file_store[f"{current_active_doc}::{fname}"] = content
                await manager.broadcast({
                    "type":     "file_created",
                    "filename": fname,
                    "content":  content,   
                    "size":     size,
                    "user":     username,
                    "doc_id":   current_active_doc,
                }, current_active_doc, exclude=websocket)


            elif mtype == "file_delete":
                fname = msg.get("name", "")
                if fname:
                    shared_file_store.pop(f"{current_active_doc}::{fname}", None)
                await manager.broadcast({
                    "type":   "file_delete",
                    "name":   fname,
                    "user":   username,
                    "doc_id": current_active_doc,
                }, current_active_doc, exclude=websocket)

            
            elif mtype == "file_content":
                fname   = msg.get("name", "")
                content = msg.get("content", "")
                if fname:
                    shared_file_store[f"{current_active_doc}::{fname}"] = content
                await manager.broadcast({
                    "type":    "file_content",
                    "name":    fname,
                    "content": content,
                    "user":    username,
                    "doc_id":  current_active_doc,
                }, current_active_doc, exclude=websocket)

            elif mtype == "chat":
                try:
                    db.add(ChatMessage(
                        document_id=int(current_active_doc),
                        user_id=db_user.id,
                        message=msg.get("message"),
                        timestamp=datetime.utcnow(),
                    ))
                    db.commit()
                    await manager.broadcast({
                        "type":      "chat",
                        "message":   msg.get("message"),
                        "username":  username,
                        "timestamp": datetime.now().strftime("%I:%M %p"),
                    }, current_active_doc)
                except Exception:
                    db.rollback()

            elif mtype == "language_change":
                new_lang = msg.get("language", "python")
                document_languages[current_active_doc] = new_lang
                asyncio.create_task(asyncio.to_thread(
                    background_save, int(current_active_doc),
                    document_snapshots.get(current_active_doc, ""), new_lang
                ))
                await manager.broadcast(msg, current_active_doc, exclude=websocket)

            elif mtype == "save_code":
                content = msg.get("content", document_snapshots.get(current_active_doc, ""))
                lang    = msg.get("language", document_languages.get(current_active_doc, "python"))
                document_snapshots[current_active_doc] = content
                document_languages[current_active_doc] = lang
                asyncio.create_task(asyncio.to_thread(background_save, int(current_active_doc), content, lang))

            elif mtype == "terminal_output":
                await send_to_user(current_active_doc, username, msg)

            elif mtype in ("input_change", "ai_suggestion", "user_typing", "folder_shared", "git_commit"):
                await manager.broadcast(msg, current_active_doc, exclude=websocket)

    except WebSocketDisconnect:
        socket_username_map.pop(websocket, None)
        manager.disconnect(current_active_doc, websocket)
        
        await broadcast_user_list(current_active_doc)
        if current_active_doc in document_snapshots:
            asyncio.create_task(asyncio.to_thread(
                background_save, int(current_active_doc),
                document_snapshots[current_active_doc],
                document_languages.get(current_active_doc, "python")
            ))

    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        socket_username_map.pop(websocket, None)
        try:
            manager.disconnect(current_active_doc, websocket)
            await broadcast_user_list(current_active_doc)
        except Exception:
            pass
    finally:
        db.close()