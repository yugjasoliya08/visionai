import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.database.dependency import get_db
from app.schemas.document_schema import DocumentCreate
from app.models.document import Document
from app.models.permission import Permission
from app.models.user import User 

router = APIRouter(prefix="/documents", tags=["documents"])

# 🟢 Schema for Email Invitation
class InviteRequest(BaseModel):
    email: str

# 🟢 CREATE: Generates a unique invite code automatically
@router.post("/")
@router.post("/create")
def create_new_document(
    doc: DocumentCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        # Generate an 8-character unique invite code
        short_code = str(uuid.uuid4())[:8].upper()

        new_doc = Document(
            title=doc.title if doc.title else "Untitled Project",
            content=doc.content if hasattr(doc, 'content') else "",
            owner_id=current_user.id, 
            language=getattr(doc, 'language', 'python'),
            invite_code=short_code 
        )
        
        if hasattr(new_doc, 'updated_at'):
            new_doc.updated_at = datetime.utcnow()

        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        # Auto-assign owner permission
        new_permission = Permission(
            user_id=current_user.id,
            document_id=new_doc.id,
            role="owner"
        )
        db.add(new_permission)
        db.commit()
        
        db.refresh(new_doc)
        print(f"📄 DOC CREATED: '{new_doc.title}' with Code: {short_code}")
        return new_doc

    except Exception as e:
        db.rollback()
        print(f"❌ CREATE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Could not create document")

# 🟢 JOIN BY CODE: User enters the 8-character code
@router.post("/join")
def join_session_by_code(
    payload: dict, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    code = payload.get("invite_code")
    if not code:
        raise HTTPException(status_code=400, detail="Invite code is required")

    doc = db.query(Document).filter(Document.invite_code == code.upper()).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid Invite Code")

    existing_perm = db.query(Permission).filter(
        Permission.document_id == doc.id, 
        Permission.user_id == current_user.id
    ).first()

    if not existing_perm:
        new_perm = Permission(user_id=current_user.id, document_id=doc.id, role="editor")
        db.add(new_perm)
        db.commit()

    return {"id": doc.id, "title": doc.title, "message": "Successfully joined!"}

# 🟢 INVITE BY EMAIL: Owner invites a user via their registered email
@router.post("/{doc_id}/invite")
def invite_user_by_email(
    doc_id: int, 
    payload: InviteRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Check if the person exists by email
    user_to_invite = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user_to_invite:
        raise HTTPException(status_code=404, detail="User with this email not found")

    # 2. Check if they already have access
    existing_perm = db.query(Permission).filter(
        Permission.document_id == doc_id, 
        Permission.user_id == user_to_invite.id
    ).first()
    
    if existing_perm:
        return {"message": "User already has access!"}

    # 3. Grant Permission
    new_perm = Permission(
        user_id=user_to_invite.id, 
        document_id=doc_id, 
        role="editor"
    )
    db.add(new_perm)
    db.commit()
    
    return {"message": f"Successfully invited {user_to_invite.username}!"}

# 🟢 LIST: Shows all documents
@router.get("/my-documents")
@router.get("/")
def get_user_documents(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    docs = (
        db.query(Document, User.username)
        .join(Permission, Document.id == Permission.document_id)
        .outerjoin(User, Document.owner_id == User.id)
        .filter(Permission.user_id == current_user.id)
        .all()
    )
    
    return [
        {
            "id": d.id, 
            "title": d.title, 
            "language": getattr(d, 'language', 'python'),
            "invite_code": getattr(d, 'invite_code', None),
            "updated_at": getattr(d, 'updated_at', None),
            "owner_username": uname,
            "created_by": uname
        } for d, uname in docs
    ]

@router.get("/{doc_id}")
def fetch_document(
    doc_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    permission = db.query(Permission).filter(
        Permission.document_id == doc_id,
        Permission.user_id == current_user.id
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="No permission")

    result = db.query(Document, User.username).outerjoin(User, Document.owner_id == User.id).filter(Document.id == doc_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc, uname = result
    
    # We need to add owner_username dynamically
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "language": getattr(doc, 'language', 'python'),
        "invite_code": getattr(doc, 'invite_code', None),
        "owner_username": uname,
        "created_by": uname
    }

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    permission = db.query(Permission).filter(
        Permission.document_id == doc_id,
        Permission.user_id == current_user.id,
        Permission.role == "owner"
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="Only owner can delete")

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        db.delete(doc)
        db.commit()
    return {"message": "Deleted"}

@router.get("/{doc_id}/collaborators")
def get_document_collaborators(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify permission first
    permission = db.query(Permission).filter(
        Permission.document_id == doc_id,
        Permission.user_id == current_user.id
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="No permission")

    doc = db.query(Document).filter(Document.id == doc_id).first()
    owner_id = doc.owner_id if doc else None

    collaborators = (
        db.query(User.id, User.username, User.email, Permission.role)
        .join(Permission, User.id == Permission.user_id)
        .filter(Permission.document_id == doc_id)
        .order_by(Permission.id.asc())
        .all()
    )

    return [
        {
            "username": c.username, 
            "email": c.email, 
            "role": "owner" if (c.id == owner_id or c.role == "owner" or idx == 0) else c.role
        } 
        for idx, c in enumerate(collaborators)
    ]