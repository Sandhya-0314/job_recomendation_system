from fastapi import APIRouter, Depends, HTTPException, status, Body, Form, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app import schemas
from app.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_input: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_input.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    new_user = models.User(
        name=user_input.name,
        email=user_input.email,
        hashed_password=hash_password(user_input.password),
        title=user_input.title,
        skills=user_input.skills,
        experience_years=user_input.experience_years,
        role=user_input.role or "user",
        preferences={
            "desired_roles": [user_input.title] if user_input.title else [],
            "location_type": "No Preference",
            "min_salary": 0
        }
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(
    request: Request,
    username: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    grant_type: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    email = None
    user_password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            if body:
                email = body.get("email")
                user_password = body.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload"
            )
    else:
        email = username
        user_password = password

    if not email or not user_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing credentials. Provide email/username and password."
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(user_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "title": user.title
        }
    }
