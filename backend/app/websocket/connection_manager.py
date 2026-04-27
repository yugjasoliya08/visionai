from typing import List, Dict, Optional
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, doc_id: str, username: str):
        await websocket.accept()
        if doc_id not in self.active_connections:
            self.active_connections[doc_id] = []
        self.active_connections[doc_id].append(websocket)
        print(f"✅ WebSocket Connected: {username} on Doc {doc_id}")

    def disconnect(self, doc_id: str, websocket: WebSocket):
        if doc_id in self.active_connections:
            if websocket in self.active_connections[doc_id]:
                self.active_connections[doc_id].remove(websocket)
            
            if not self.active_connections[doc_id]:
                del self.active_connections[doc_id]

    async def broadcast(self, message: dict, doc_id: str, exclude: Optional[WebSocket] = None):
        """Sends a message to all users in a specific document room."""
        if doc_id in self.active_connections:
            for connection in self.active_connections[doc_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        print(f"⚠️ Broadcast failed for one client: {e}")

manager = ConnectionManager()