
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database.connection import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Untitled Project")
    content = Column(Text, default="")
    owner_id = Column(Integer, ForeignKey("users.id"))
    
   
    language = Column(String, default="python")
    invite_code = Column(String, unique=True, index=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)