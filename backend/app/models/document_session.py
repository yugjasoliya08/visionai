from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
from app.database.connection import Base


class DocumentSession(Base):

    __tablename__ = "document_sessions"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(Integer)

    user_id = Column(Integer)

    joined_at = Column(DateTime, default=datetime.utcnow)