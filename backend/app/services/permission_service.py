from app.models.permission import Permission

def get_user_role(db, user_id: int, doc_id: int):
    perm = db.query(Permission).filter(
        Permission.user_id == user_id,
        Permission.document_id == doc_id
    ).first()

    if perm:
        return perm.role

    
    return None