import sys
import os

# Set Python path to include the current directory so app imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models
from app.recommendation import calculate_match

def test_recommendations():
    print("Recreating database tables for auth schema update...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Checking seeded databases...")
        # Since startup event runs in FastAPI, let's manually invoke seed if it looks empty
        from app.main import seed_database
        seed_database(db)
        
        user = db.query(models.User).first()
        if not user:
            print("ERROR: User seed failed!")
            return
            
        print(f"\nUser details: Name={user.name}, Title='{user.title}'")
        print(f"Skills: {user.skills}")
        print(f"Desired Roles: {user.preferences.get('desired_roles')}")
        print(f"Location Preference: {user.preferences.get('location_type')}")
        print(f"Min Salary: {user.preferences.get('min_salary')}\n")
        
        jobs = db.query(models.Job).all()
        print(f"Found {len(jobs)} jobs in db.")
        print("-" * 60)
        
        for job in jobs:
            res = calculate_match(user, job)
            print(f"Job: '{job.title}' at {job.company} ({job.type})")
            print(f"  Match Score: {res['score']}%")
            print(f"  Matched Skills: {res['matched_skills']}")
            print(f"  Missing Skills: {res['missing_skills']}")
            print(f"  Experience Status: {res['experience_status']}")
            print(f"  Breakdown: {res['breakdown']}")
            print("-" * 60)

        # Test application tracking lifecycle
        print("\nVerifying Application status database lifecycle...")
        job_to_test = jobs[0]
        # Clear existing application if any to ensure clean test run
        db.query(models.Application).filter(
            models.Application.user_id == user.id,
            models.Application.job_id == job_to_test.id
        ).delete()
        db.commit()

        # 1. Create Application
        app_entry = models.Application(user_id=user.id, job_id=job_to_test.id, status="Applied")
        db.add(app_entry)
        db.commit()
        db.refresh(app_entry)
        print(f"Created application ID={app_entry.id} with status='{app_entry.status}'")
        assert app_entry.status == "Applied"

        # 2. Update Application Status
        app_entry.status = "Interviewing"
        db.commit()
        db.refresh(app_entry)
        print(f"Updated application ID={app_entry.id} status to '{app_entry.status}'")
        assert app_entry.status == "Interviewing"

        print("Application tracking database lifecycle test: SUCCESS\n")

        # Test auth hashing and verification security helpers
        print("Verifying password hashing and credentials check...")
        from app.security import hash_password, verify_password, create_access_token, parse_access_token
        h_pw = hash_password("secret_pass")
        assert verify_password("secret_pass", h_pw)
        assert not verify_password("wrong_pass", h_pw)
        print("Password cryptography helpers: SUCCESS")

        # Test JWT token parsing
        print("Verifying JWT token generation and validation...")
        tok = create_access_token({"sub": "42", "role": "user"})
        payload = parse_access_token(tok)
        assert payload is not None
        assert payload.get("sub") == "42"
        assert payload.get("role") == "user"
        print("JWT Token validation: SUCCESS\n")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_recommendations()
