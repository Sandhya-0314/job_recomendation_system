from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

# Pydantic schemas for request/response serialization
class JobBase(BaseModel):
    title: str
    company: str
    location: str
    type: str # Full-time, Part-time, Contract, Remote, Hybrid
    salary: Optional[int] = None
    description: str
    requirements: List[str] = Field(default_factory=list)
    experience_level: int = 0

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    class Config:
        from_attributes = True

class UserPreferences(BaseModel):
    desired_roles: List[str] = Field(default_factory=list)
    location_type: str = "No Preference" # Remote, Hybrid, Onsite, No Preference
    min_salary: int = 0

class UserBase(BaseModel):
    name: str
    email: str
    title: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    preferences: UserPreferences = Field(default_factory=UserPreferences)

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    job: JobResponse
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_status: str
    breakdown: dict

class ApplicationStatusUpdate(BaseModel):
    status: str

class ApplicationAdminResponse(BaseModel):
    id: int
    user: UserResponse
    job: JobResponse
    match_score: float
    status: str
    applied_date: datetime.datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    title: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    role: Optional[str] = "user"
