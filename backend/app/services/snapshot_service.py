from sqlalchemy.orm import Session
from app.models.snapshot import Snapshot
from app.models.document import Document  
from datetime import datetime

MAX_SNAPSHOTS = 30

def save_snapshot(db: Session, doc_id: int, content: str):
    """
    Saves a version to history AND updates the master document content.
    This prevents the 'Old Code on Refresh' bug.
    """
    master_doc = db.query(Document).filter(Document.id == doc_id).first()
    if master_doc:
        master_doc.content = content
        master_doc.updated_at = datetime.utcnow()
    else:
        
        master_doc = Document(id=doc_id, content=content)
        db.add(master_doc)
    
    new_snapshot = Snapshot(
        document_id=doc_id,
        content=content,
        created_at=datetime.utcnow()
    )
    db.add(new_snapshot)
    db.commit()
    db.refresh(new_snapshot)

    
    snapshots = (
        db.query(Snapshot)
        .filter(Snapshot.document_id == doc_id)
        .order_by(Snapshot.created_at.asc())
        .all()
    )

    if len(snapshots) > MAX_SNAPSHOTS:
    
        db.delete(snapshots[0])
        db.commit()

    print(f"✅ DB SYNC COMPLETE: Master Doc and History updated for Doc {doc_id}")
    return new_snapshot

def get_latest_snapshot(db: Session, doc_id: int):
    """Retrieves the absolute latest version saved in the snapshots table"""
    return (
        db.query(Snapshot)
        .filter(Snapshot.document_id == doc_id)
        .order_by(Snapshot.created_at.desc())
        .first()
    )

def get_snapshots(db: Session, doc_id: int):
    """Returns all available versions for the 'History' sidebar"""
    return (
        db.query(Snapshot)
        .filter(Snapshot.document_id == doc_id)
        .order_by(Snapshot.created_at.desc())
        .all()
    )