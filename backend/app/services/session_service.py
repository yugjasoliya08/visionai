from sqlalchemy.orm import Session
from app.models.document_session import DocumentSession

def create_session(db: Session, user_id: int, document_id: int):
 
    session = DocumentSession(
        user_id=user_id,
        document_id=document_id
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session