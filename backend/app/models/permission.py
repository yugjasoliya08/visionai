from sqlalchemy import Column, Integer, String
from app.database.connection import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    document_id = Column(Integer, index=True)
    role = Column(String)