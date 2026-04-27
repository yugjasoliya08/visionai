from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.dependency import get_db
from app.models.user import DocumentHistory  # Ensure this matches your model file
from app.websocket.editor_socket import document_snapshots, document_versions
from app.services.redis_service import redis_client
from app.services.diff_service import get_diff
import json

router = APIRouter(prefix="/versions", tags=["versions"])

# 🟢 NEW: Save a specific version to PostgreSQL
@router.post("/{doc_id}/save")
def save_version(doc_id: int, payload: dict, db: Session = Depends(get_db)):
    content = payload.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="Content is required")

    try:
        new_version = DocumentHistory(
            document_id=doc_id,
            content=content,
            timestamp=datetime.utcnow()
        )
        db.add(new_version)
        db.commit()
        db.refresh(new_version)
        print(f"💾 SAVED: New version for Doc {doc_id}")
        return {"message": "Version saved successfully"}
    except Exception as e:
        db.rollback()
        print(f"❌ SAVE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Could not save version")

@router.get("/{doc_id}")
def get_versions(doc_id: int, db: Session = Depends(get_db)):
    records = db.query(DocumentHistory).filter(
        DocumentHistory.document_id == doc_id
    ).order_by(DocumentHistory.timestamp.desc()).limit(20).all()
    
    # 🟢 Return a list of objects so frontend can show the timestamp
    history_list = [
        {
            "content": r.content, 
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        } for r in records
    ]
    
    print(f"🕰️ HISTORY API: Found {len(history_list)} versions for Doc {doc_id}.")
    return history_list # Return as a direct list []

@router.post("/restore/{doc_id}/{version_index}")
async def restore_version(doc_id: int, version_index: int, db: Session = Depends(get_db)):
    records = db.query(DocumentHistory).filter(
        DocumentHistory.document_id == doc_id
    ).order_by(DocumentHistory.timestamp.desc()).limit(20).all()
    
    if version_index < 0 or version_index >= len(records):
        raise HTTPException(status_code=400, detail="Invalid version index")

    selected_version = records[version_index].content
    doc_id_str = str(doc_id)

    # 1. Update live snapshot
    document_snapshots[doc_id_str] = selected_version
    if doc_id_str in document_versions:
        document_versions[doc_id_str] += 1

    # 2. BROADCAST to all users via Redis
    snapshot_message = json.dumps({
        "type": "snapshot",
        "content": selected_version,
        "version": document_versions.get(doc_id_str, 0)
    })
    await redis_client.publish(f"document:{doc_id_str}", snapshot_message)

    return {"message": "Version restored", "content": selected_version}

@router.get("/compare/{doc_id}/{v1}/{v2}")
def compare_versions(doc_id: int, v1: int, v2: int, db: Session = Depends(get_db)):
    records = db.query(DocumentHistory).filter(
        DocumentHistory.document_id == doc_id
    ).order_by(DocumentHistory.timestamp.desc()).limit(20).all()

    if v1 < 0 or v1 >= len(records) or v2 < 0 or v2 >= len(records):
        raise HTTPException(status_code=400, detail="Invalid version index")

    return get_diff(records[v1].content, records[v2].content)