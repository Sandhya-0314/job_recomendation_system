def calculate_match(user, job) -> dict:
    """
    Calculate the match percentage between a User and a Job.
    Returns a dict with overall score and match breakdown details.
    """
    user_skills = set(s.strip().lower() for s in (user.skills or []))
    job_reqs = set(r.strip().lower() for r in (job.requirements or []))
    
    # 1. Skills Matching (50% weight)
    matched_skills_raw = []
    missing_skills_raw = []
    
    # Track raw casing from job requirements for better UI rendering
    for req in (job.requirements or []):
        req_lower = req.strip().lower()
        if req_lower in user_skills:
            matched_skills_raw.append(req)
        else:
            missing_skills_raw.append(req)
            
    if not job_reqs:
        skills_score = 1.0
    else:
        skills_score = len(matched_skills_raw) / len(job_reqs)
        
    # 2. Experience Matching (25% weight)
    # job.experience_level is minimum years of experience required
    user_exp = user.experience_years or 0
    job_exp = job.experience_level or 0
    
    if job_exp == 0:
        experience_score = 1.0
        exp_status = "Excellent Fit"
    elif user_exp >= job_exp:
        experience_score = 1.0
        if user_exp - job_exp >= 5:
            exp_status = "Overqualified"
        else:
            exp_status = "Excellent Fit"
    else:
        # Scale score between 0.3 and 0.9 based on gap
        experience_score = max(0.3, user_exp / job_exp)
        exp_status = f"Requires {job_exp - user_exp} more years"

    # 3. Job Title Alignment (15% weight)
    # Compare user's title and desired roles against job title
    title_score = 0.0
    job_title_words = set(job.title.lower().replace("-", " ").replace("/", " ").split())
    
    desired_roles = user.preferences.get("desired_roles", []) if user.preferences else []
    # Include user's main title in search
    role_queries = [user.title] if user.title else []
    if desired_roles:
        role_queries.extend(desired_roles)
        
    if not role_queries:
        title_score = 0.5  # Neutral score if no preferences specified
    else:
        best_role_score = 0.0
        for role in role_queries:
            if not role:
                continue
            role_words = set(role.lower().replace("-", " ").replace("/", " ").split())
            intersection = role_words.intersection(job_title_words)
            union = role_words.union(job_title_words)
            jaccard = len(intersection) / len(union) if union else 0.0
            
            # Boost if the role is a direct substring of the job title
            if role.lower() in job.title.lower() or job.title.lower() in role.lower():
                jaccard = max(jaccard, 0.8)
            best_role_score = max(best_role_score, jaccard)
        title_score = best_role_score

    # 4. Preferences Matching (10% weight) - Location & Salary
    pref_score = 0.5 # Neutral base
    loc_type_score = 1.0
    salary_score = 1.0
    
    # A. Location & Type matching (e.g. Remote vs Onsite)
    # job.type can be Remote, Hybrid, Onsite, Full-time, etc.
    user_pref_loc = user.preferences.get("location_type", "No Preference") if user.preferences else "No Preference"
    job_type_lower = job.type.lower()
    
    if user_pref_loc != "No Preference":
        pref_loc_lower = user_pref_loc.lower()
        if pref_loc_lower in job_type_lower or job_type_lower in pref_loc_lower:
            loc_type_score = 1.0
        elif pref_loc_lower == "remote" and "hybrid" in job_type_lower:
            loc_type_score = 0.5
        elif pref_loc_lower == "hybrid" and "remote" in job_type_lower:
            loc_type_score = 0.8
        else:
            loc_type_score = 0.2

    # B. Salary matching
    user_min_salary = user.preferences.get("min_salary", 0) if user.preferences else 0
    job_salary = job.salary or 0
    
    if user_min_salary > 0 and job_salary > 0:
        if job_salary >= user_min_salary:
            salary_score = 1.0
        else:
            salary_score = max(0.4, job_salary / user_min_salary)
            
    pref_score = (loc_type_score * 0.5) + (salary_score * 0.5)

    # Calculate overall weighted score
    overall_score = (
        (skills_score * 0.50) + 
        (experience_score * 0.25) + 
        (title_score * 0.15) + 
        (pref_score * 0.10)
    ) * 100

    return {
        "job_id": job.id,
        "score": round(overall_score, 1),
        "matched_skills": matched_skills_raw,
        "missing_skills": missing_skills_raw,
        "experience_status": exp_status,
        "breakdown": {
            "skills": round(skills_score * 100, 1),
            "experience": round(experience_score * 100, 1),
            "title": round(title_score * 100, 1),
            "preferences": round(pref_score * 100, 1)
        }
    }
