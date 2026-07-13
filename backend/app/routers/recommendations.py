# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models
from app import schemas
from app.dependencies import get_current_user
from app.recommendation import calculate_match

router = APIRouter(prefix="/api/users", tags=["recommendations"])

@router.get("/{user_id}/recommendations", response_model=List[schemas.RecommendationResponse])
def get_user_recommendations(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    jobs = db.query(models.Job).all()
    recommendations = []
    
    for job in jobs:
        match_details = calculate_match(user, job)
        recommendations.append(
            {
                "job": job,
                "match_score": match_details["score"],
                "matched_skills": match_details["matched_skills"],
                "missing_skills": match_details["missing_skills"],
                "experience_status": match_details["experience_status"],
                "breakdown": match_details["breakdown"]
            }
        )
        
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
