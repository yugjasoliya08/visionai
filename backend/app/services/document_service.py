from sqlalchemy.orm import Session
from app.models.document import Document

def create_document(db: Session, title: str, content: str, owner_id: int):
    doc = Document(
        title=title,
        content=content,
        owner_id=owner_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def get_document(db: Session, doc_id: int):
    return db.query(Document).filter(Document.id == doc_id).first()

def get_all_documents(db: Session):
    return db.query(Document).all()

def update_document_content(db: Session, doc_id: int, content: str):

    document = db.query(Document).filter(Document.id == doc_id).first()

    if document:
        document.content = content
        db.commit()
        db.refresh(document)
    
    return document