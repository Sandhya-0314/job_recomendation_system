from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models
from app import schemas
from app.dependencies import get_current_user, require_admin
from app.recommendation import calculate_match

router = APIRouter(tags=["applications"])

@router.get("/api/users/{user_id}/bookmarks", response_model=List[schemas.JobResponse])
def get_user_bookmarks(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    bookmarks = db.query(models.Bookmark).filter(models.Bookmark.user_id == user_id).all()
    job_ids = [b.job_id for b in bookmarks]
    return db.query(models.Job).filter(models.Job.id.in_(job_ids)).all() if job_ids else []

@router.post("/api/jobs/{job_id}/bookmark")
def toggle_bookmark(job_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == user_id,
        models.Bookmark.job_id == job_id
    ).first()
    
    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {"bookmarked": False, "message": "Job removed from bookmarks"}
    else:
        new_bookmark = models.Bookmark(user_id=user_id, job_id=job_id)
        db.add(new_bookmark)
        db.commit()
        return {"bookmarked": True, "message": "Job added to bookmarks"}

@router.get("/api/users/{user_id}/applications")
def get_user_applications(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = db.query(models.Application).filter(models.Application.user_id == user_id).all()
    results = []
    for app_item in apps:
        job = db.query(models.Job).filter(models.Job.id == app_item.job_id).first()
        results.append({
            "id": app_item.id,
            "job": job,
            "status": app_item.status,
            "applied_date": app_item.applied_date
        })
    return results

@router.post("/api/jobs/{job_id}/apply")
def apply_for_job(job_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    existing_app = db.query(models.Application).filter(
        models.Application.user_id == user_id,
        models.Application.job_id == job_id
    ).first()
    
    if existing_app:
        return {"applied": True, "message": "Already applied for this job", "status": existing_app.status}
        
    new_app = models.Application(user_id=user_id, job_id=job_id, status="Applied")
    db.add(new_app)
    db.commit()
    return {"applied": True, "message": "Successfully applied for the job", "status": "Applied"}

@router.get("/api/applications", response_model=List[schemas.ApplicationAdminResponse])
def get_all_applications(db: Session = Depends(get_db), admin_user: models.User = Depends(require_admin)):
    apps = db.query(models.Application).all()
    results = []
    for app_item in apps:
        user = db.query(models.User).filter(models.User.id == app_item.user_id).first()
        job = db.query(models.Job).filter(models.Job.id == app_item.job_id).first()
        if user and job:
            match_details = calculate_match(user, job)
            results.append({
                "id": app_item.id,
                "user": user,
                "job": job,
                "match_score": match_details["score"],
                "status": app_item.status,
                "applied_date": app_item.applied_date
            })
    return results

@router.patch("/api/applications/{app_id}/status")
def update_application_status(app_id: int, status_input: schemas.ApplicationStatusUpdate, db: Session = Depends(get_db), admin_user: models.User = Depends(require_admin)):
    app_item = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app_item:
        raise HTTPException(status_code=404, detail="Application not found")
    
    valid_statuses = ["Applied", "Interviewing", "Offered", "Rejected"]
    if status_input.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    app_item.status = status_input.status
    db.commit()
    db.refresh(app_item)
    return {"success": True, "status": app_item.status, "message": f"Application status updated to {app_item.status}"}
