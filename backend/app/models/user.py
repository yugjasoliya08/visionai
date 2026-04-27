from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String) 

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DocumentHistory(Base):
    __tablename__ = "document_history"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)