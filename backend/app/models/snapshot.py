from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime
from app.database.connection import Base

class Snapshot(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True) 
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)