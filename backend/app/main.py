import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv 

# 1. Load environment variables BEFORE importing other app modules
load_dotenv()

from app.database.connection import engine, Base
from app.models import snapshot, user, document, permission

from app.api.routes.version import router as version_router
from app.api.routes.snapshot import router as snapshot_router
from app.websocket.editor_socket import router as ws_router
from app.api.routes.documents import router as document_router
from app.api.routes.auth import router as auth_router 
from app.api.routes.invite import router as invite_router
from app.api.routes.chat import router as chat_router
from app.api.routes.code import router as code_router
from app.api.routes.ai import router as ai_router

from app.services.redis_service import redis_client 
from app.code_runner import execution_worker

# Initialize database tables
snapshot.Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine) 

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[STARTING] Background Execution Worker...")
    worker_task = asyncio.create_task(execution_worker())
    
    yield  
    
    print("[STOPPING] Background Execution Worker...")
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="VisionAI Collaborative Editor",
    description="Real-time collaborative code editor with AI assistance",
    lifespan=lifespan
)

# Added specific origins for security, keep ["*"] only if you are still testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router)  
app.include_router(ws_router) 

app.include_router(ai_router) 
app.include_router(code_router)

app.include_router(chat_router)
app.include_router(document_router)
app.include_router(invite_router)

app.include_router(version_router)
app.include_router(snapshot_router)

@app.get("/", tags=["Health Check"])
def home():
    return {"message": "VisionAI Collaborative Editor Backend Running"}

@app.get("/test-db", tags=["Health Check"])
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            connection.commit() # Important for some Postgres versions
        return {"database": "connected"}
    except Exception as e:
        return {"database": "failed", "error": str(e)}

@app.get("/test-redis", tags=["Health Check"]) 
async def test_redis():
    try:
        await redis_client.set("test_key", "Redis connection verified!")
        value = await redis_client.get("test_key")
        return {"redis": value}
    except Exception as e:
        return {"redis_error": str(e)}