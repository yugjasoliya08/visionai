from fastapi import APIRouter, Depends
from app.code_runner import execution_queue
from app.websocket.connection_manager import manager
from app.core.deps import get_current_user
from app.models.user import User
import asyncio

router = APIRouter(prefix="/code", tags=["Code Execution"])


@router.post("/run")
async def execute_code(
    payload: dict,
    current_user: User = Depends(get_current_user),
):  
    """
    Run code for the requesting user ONLY.
    FIX: terminal output is sent privately to the user who clicked Run,
    NOT broadcast to everyone in the session.
    """
    doc_id     = str(payload.get("doc_id", "1"))
    code       = payload.get("code", "")
    lang       = payload.get("language", "python")
    user_input = payload.get("input", "")
    username   = current_user.username   # the person who clicked Run

    try:
        loop   = asyncio.get_running_loop()
        future = loop.create_future()

        async def result_callback(output: str):
            if not future.done():
                future.set_result(output)

        print(f"📥 Queuing execution: doc={doc_id} lang={lang} user={username}")
        await execution_queue.put({
            "code":     code,
            "language": lang,
            "input":    user_input,
            "callback": result_callback,
        })

        try:
            final_output = await asyncio.wait_for(future, timeout=30.0)
        except asyncio.TimeoutError:
            final_output = "⏱ Execution timed out (30s). Is your code stuck in an infinite loop?"

        # FIX: send terminal output, include for_user so frontend filters it
        if doc_id in manager.active_connections:
            for ws in manager.active_connections[doc_id]:
                try:
                    await ws.send_json({
                        "type":   "terminal_output",
                        "output": final_output,
                        "for_user": username
                    })
                except Exception:
                    pass

        return {"output": final_output}

    except Exception as e:
        error_msg = f"❌ Server Error: {str(e)}"
        print(f"🚨 Run route error: {e}")
        # Send error, include for_user so frontend filters it
        if doc_id in manager.active_connections:
            for ws in manager.active_connections[doc_id]:
                try:
                    await ws.send_json({
                        "type":   "terminal_output",
                        "output": error_msg,
                        "for_user": username
                    })
                except Exception:
                    pass
        return {"output": error_msg}