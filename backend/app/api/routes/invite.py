from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.dependency import get_db
from app.models.permission import Permission
from app.core.deps import get_current_user # ⚠️ The Bouncer!

router = APIRouter(prefix="/invite", tags=["invite"])

# This tells Swagger exactly what JSON to expect
class InviteRequest(BaseModel):
    user_id: int
    doc_id: int
    role: str

@router.post("/")
def invite_user(
    invite: InviteRequest, 
    current_user: str = Depends(get_current_user), # Must be logged in to invite!
    db: Session = Depends(get_db)
):
    # 1. Check if they are already on the guest list (prevents duplicates)
    existing_invite = db.query(Permission).filter(
        Permission.user_id == invite.user_id,
        Permission.document_id == invite.doc_id
    ).first()

    if existing_invite:
        return {"message": "User is already on the guest list!"}

    # 2. Put them on the guest list!
    new_permission = Permission(
        user_id=invite.user_id,
        document_id=invite.doc_id,
        role=invite.role
    )

    db.add(new_permission)
    db.commit()

    return {"message": f"User ID {invite.user_id} successfully invited as {invite.role}!"}