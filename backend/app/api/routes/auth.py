from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.dependency import get_db # 🟢 Using your existing dependency
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if the username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # 2. Check if the email already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # 3. Hash and Save
        hashed_pw = hash_password(user.password)
        new_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_pw
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User created successfully", "username": new_user.username}
    except Exception as e:
        db.rollback()
        print(f"❌ Registration Error: {e}")
        raise HTTPException(status_code=500, detail="Database error during registration")

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find user
    db_user = db.query(User).filter(User.username == user.username).first()
    
    if not db_user:
        print(f"❌ Login failed: User '{user.username}' not found")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 2. Verify Password using the 'hashed_password' column
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        print(f"❌ Login failed: Incorrect password for '{user.username}'")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 3. Create Token
    print(f"✅ Login successful for: {user.username}")
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

  