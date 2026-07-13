from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app import models
from app.security import hash_password
from app.routers import auth, users, jobs, applications, recommendations, ai, resume

app = FastAPI(title="Job Recommendation Engine API")

# Create tables
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database function
def seed_database(db: Session):
    # Check if we already have jobs in the database
    if db.query(models.Job).count() > 0:
        return
        
    # Seed Jobs
    jobs = [
        models.Job(
            title="Senior React Developer",
            company="TechNova Solutions",
            location="Remote",
            type="Remote",
            salary=120000,
            description="We are seeking a Senior React Developer to join our frontend architecture team. You will lead development of our dashboard portal, design responsive component libraries, and optimize client-side performances. Great environment, remote-first workflow, and modern design systems.",
            requirements=["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux"],
            experience_level=5
        ),
        models.Job(
            title="Python Backend Engineer",
            company="PyStream AI",
            location="Chicago, IL",
            type="Hybrid",
            salary=110000,
            description="Join our backend scaling division. You will build and optimize RESTful endpoints using FastAPI, manage highly concurrent data streams, tune SQLAlchemy Postgres schemas, and deploy containerized services into Kubernetes. Experience with asyncio is a plus.",
            requirements=["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Docker", "REST API"],
            experience_level=3
        ),
        models.Job(
            title="Junior Frontend Engineer",
            company="CodeLabs",
            location="San Francisco, CA",
            type="Onsite",
            salary=75000,
            description="Are you looking to break into the tech industry? We are hiring a Junior Frontend developer. You will build layouts using clean HTML/Vanilla CSS, write React UI pages, and work closely with seasoned design leaders. Mentorship is provided, great for early career builders.",
            requirements=["React", "JavaScript", "HTML", "CSS", "Figma"],
            experience_level=1
        ),
        models.Job(
            title="Data Scientist / ML Engineer",
            company="InsightCorp",
            location="Remote",
            type="Remote",
            salary=135000,
            description="Looking for an analytical mind to join our AI insights division. The role involves designing recommendation pipelines, performing exploratory data analyses on millions of customer sessions, writing SQL scripts, and preparing interactive Tableau dashboards.",
            requirements=["Python", "SQL", "Pandas", "Machine Learning", "Data Analysis", "Tableau"],
            experience_level=4
        ),
        models.Job(
            title="Product Designer",
            company="Canvas Studio",
            location="New York, NY",
            type="Onsite",
            salary=95000,
            description="Collaborate with engineering teams to shape our SaaS tool. Create wireframes, user flow diagrams, and pixel-perfect high-fidelity mockups in Figma. Conduct user testing to run usability evaluations. Passion for transitions and micro-interactions valued.",
            requirements=["Figma", "UI/UX Design", "Wireframing", "Prototyping", "User Research"],
            experience_level=2
        ),
        models.Job(
            title="DevOps Engineer",
            company="CloudFlow",
            location="Remote",
            type="Remote",
            salary=125000,
            description="We are seeking a DevOps engineer to implement automated cloud infrastructure. You will manage AWS resources, create CI/CD pipelines, package services in Docker, orchestrate Kubernetes clusters, and write infrastructure-as-code scripts in Terraform.",
            requirements=["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD"],
            experience_level=4
        ),
        models.Job(
            title="HR Recruiter",
            company="GrowthScale",
            location="Remote",
            type="Remote",
            salary=65000,
            description="Own the end-to-end recruitment process for engineering hiring. Source qualified candidates across job boards, handle initial interviews, schedule panel sessions, and conduct offer letter negotiations. Excellent verbal and written communication skills required.",
            requirements=["Recruitment", "Communication", "HR Tools", "Sourcing"],
            experience_level=2
        )
    ]
    for job in jobs:
        db.add(job)
    
    # Seed default user if not exists
    if db.query(models.User).count() == 0:
        default_user = models.User(
            name="Chaithanya",
            email="chaithanya@example.com",
            hashed_password=hash_password("password123"),
            role="admin",
            title="Full Stack Software Engineer",
            skills=["Python", "FastAPI", "React", "JavaScript", "SQL"],
            experience_years=3,
            preferences={
                "desired_roles": ["Backend Engineer", "Software Developer", "Full Stack Developer"],
                "location_type": "Remote",
                "min_salary": 90000
            }
        )
        db.add(default_user)
        
    db.commit()

@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(recommendations.router)
app.include_router(ai.router)
app.include_router(resume.router)

