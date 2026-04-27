from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependency import get_db  # ⚠️ Fixed import path!
from app.services.snapshot_service import get_snapshots

router = APIRouter(prefix="/snapshots", tags=["snapshots"])

@router.get("/{doc_id}")
def fetch_snapshots(doc_id: int, db: Session = Depends(get_db)):
    return get_snapshots(db, doc_id)