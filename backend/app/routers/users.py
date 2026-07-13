# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app import schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this profile")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user_profile(user_id: int, user_input: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify this profile")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        user = models.User(id=user_id)
        db.add(user)
    
    user.name = user_input.name
    user.email = user_input.email
    user.title = user_input.title
    user.skills = user_input.skills
    user.experience_years = user_input.experience_years
    user.preferences = user_input.preferences.dict()
    
    db.commit()
    db.refresh(user)
    return user
