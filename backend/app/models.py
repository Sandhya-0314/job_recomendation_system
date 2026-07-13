from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=True)
    skills = Column(JSON, default=list) # List of strings e.g. ["Python", "React"]
    experience_years = Column(Integer, default=0)
    preferences = Column(JSON, default=dict) # e.g. {"location_type": "Remote", "min_salary": 70000, "desired_roles": []}
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="user")

    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(String, nullable=False) # Full-time, Part-time, Contract, Remote, Hybrid
    salary = Column(Integer, nullable=True) # Annual salary or rate
    description = Column(Text, nullable=False)
    requirements = Column(JSON, default=list) # List of strings e.g. ["SQL", "FastAPI"]
    experience_level = Column(Integer, default=0) # Minimum years of experience required
    posted_date = Column(DateTime, default=datetime.datetime.utcnow)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="job", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="Applied") # Applied, Interviewing, Offered, Rejected
    applied_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    job = relationship("Job", back_populates="bookmarks")
