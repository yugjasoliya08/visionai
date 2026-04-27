from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

SECRET_KEY = "mysecretkey"  
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    
    if "username" in to_encode and "sub" not in to_encode:
        to_encode["sub"] = to_encode["username"]

    
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            print("❌ verify_token: 'sub' field missing")
            return None
            
        print(f"✅ Token verified for user: {username}")
        return username 
        
    except JWTError as e:
        print(f"❌ verify_token error: {e}")
        return None