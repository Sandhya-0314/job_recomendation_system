# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models
from app import schemas
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("", response_model=List[schemas.JobResponse])
def get_all_jobs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Job).order_by(models.Job.posted_date.desc()).all()

@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_input: schemas.JobCreate, db: Session = Depends(get_db), admin_user: models.User = Depends(require_admin)):
    new_job = models.Job(
        title=job_input.title,
        company=job_input.company,
        location=job_input.location,
        type=job_input.type,
        salary=job_input.salary,
        description=job_input.description,
        requirements=job_input.requirements,
        experience_level=job_input.experience_level
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job
