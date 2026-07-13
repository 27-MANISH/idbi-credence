from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from uuid import uuid4
from datetime import datetime, timezone

from app.models.schemas import UserCreate, UserLogin, Token, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.db.supabase_client import supabase_client

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    res = supabase_client.table("users").select("*").eq("email", email).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return res.data[0]

@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate):
    # Check if user already exists
    existing = supabase_client.table("users").select("id").eq("email", user_in.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Hash password
    hashed = get_password_hash(user_in.password)
    
    # Adjust role to match database allowed enums
    role_to_insert = user_in.role
    if role_to_insert not in ["FACULTY", "HOD", "REVIEWER", "PRINCIPAL", "ADMIN", "ACCOUNTS"]:
        role_to_insert = "REVIEWER" # Map default to REVIEWER (the credit underwriter role)
        
    user_payload = {
        "id": str(uuid4()),
        "email": user_in.email,
        "password_hash": hashed,
        "name": user_in.name,
        "role": role_to_insert,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    res = supabase_client.table("users").insert(user_payload).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user in database"
        )
        
    # Return formatted response
    user_data = res.data[0]
    return {
        "id": user_data["id"],
        "email": user_data["email"],
        "name": user_data["name"],
        "role": user_data["role"],
        "is_active": user_data["is_active"],
        "created_at": user_data["created_at"]
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    res = supabase_client.table("users").select("*").eq("email", credentials.email).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = res.data[0]
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    token = create_access_token(subject=user["email"])
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "is_active": current_user.get("is_active", True),
        "created_at": current_user.get("created_at") or datetime.now(timezone.utc).isoformat()
    }
