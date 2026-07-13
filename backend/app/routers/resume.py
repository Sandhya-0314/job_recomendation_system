from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/api/resume", tags=["resume"])

class ResumeComparePayload(BaseModel):
    skills: List[str]
    experience_years: int

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    filename = file.filename or ""
    contents = await file.read()
    
    if filename.lower().endswith(".pdf"):
        try:
            text = ResumeService.extract_text_from_pdf(contents)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_420_METHOD_FAILURE if hasattr(status, "HTTP_420_METHOD_FAILURE") else 400,
                detail=f"Failed to process PDF content: {str(e)}"
            )
    else:
        # Fallback to plain text decoding
        try:
            text = contents.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail="Unable to decode file content. Please upload a plain text or PDF file."
            )
            
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="The uploaded file contains no readable text."
        )

    parsed = ResumeService.parse_resume_text(text)
    return parsed

@router.post("/compare/{job_id}")
def compare_to_job(
    job_id: int,
    payload: ResumeComparePayload,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job listing with ID {job_id} not found."
        )
        
    parsed_resume = {
        "skills": payload.skills,
        "experience_years": payload.experience_years
    }
    
    comparison = ResumeService.compare_resume_to_job(parsed_resume, job)
    return comparison
