from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.dependency import get_db
from app.models.user import ChatMessage, User
from app.core.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["Collaboration"])

@router.get("/{doc_id}")
def get_chat_history(
    doc_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all chat history for a specific document.
    Ensures that when a user refreshes, the chat is re-loaded from PostgreSQL.
    """
    # 🟢 Fetching chats for the specific document
    chats = (
        db.query(ChatMessage)
        .filter(ChatMessage.document_id == doc_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    
    formatted_chats = []
    for chat in chats:
        # 🟢 FIX: Manually fetch user to prevent 'AttributeError'
        sender = db.query(User).filter(User.id == chat.user_id).first()
        username = sender.username if sender else "Unknown User"
        
        formatted_chats.append({
            "username": username,
            "message": chat.message,
            # Formatting timestamp for a cleaner UI (e.g., 10:45 AM)
            "timestamp": chat.timestamp.strftime("%I:%M %p") if chat.timestamp else ""
        })
        
    return formatted_chats