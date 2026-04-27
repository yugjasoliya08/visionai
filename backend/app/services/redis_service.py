import redis.asyncio as redis
import json
from typing import Dict, Any, AsyncGenerator
from app.services.ot_service import Op, op_to_json, json_to_op

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
    db=0
)

async def publish_op(doc_id: str, op: Op, client_version: int, username: str):
    """Publish OT operation to doc channel."""
    msg = {
        "doc_id": doc_id,
        "op": op_to_json(op),
        "client_version": client_version,
        "username": username,
        "timestamp": redis_client.time()[0]
    }
    await redis_client.publish(f"ot:{doc_id}", json.dumps(msg))

async def subscribe_to_doc(doc_id: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Subscribe to ops for a document."""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"ot:{doc_id}")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                yield {
                    "doc_id": data["doc_id"],
                    "op": json_to_op(data["op"]),
                    "client_version": data["client_version"],
                    "username": data["username"],
                    "timestamp": data["timestamp"]
                }
    finally:
        await pubsub.unsubscribe(f"ot:{doc_id}")
        await pubsub.close()

async def get_document_snapshot(doc_id: str) -> str:
    """Get cached snapshot from Redis."""
    snap = await redis_client.get(f"snapshot:{doc_id}")
    return snap.decode() if snap else ""

async def set_document_snapshot(doc_id: str, snapshot: str, version: int):
    """Cache snapshot with version."""
    await redis_client.set(f"snapshot:{doc_id}", snapshot)
    await redis_client.set(f"version:{doc_id}", str(version))

async def get_document_version(doc_id: str) -> int:
    """Get cached version."""
    ver = await redis_client.get(f"version:{doc_id}")
    return int(ver) if ver else 0

async def document_exists(doc_id: str) -> bool:
    """Check if doc has active connections."""
    count = await redis_client.get(f"active:{doc_id}")
    return bool(count)
