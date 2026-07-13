import io
import re
import json
import os
from pypdf import PdfReader
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app import models
# pyrefly: ignore [missing-import]
from langchain_community.chat_models import ChatOpenAI
# pyrefly: ignore [missing-import]
from langchain.chains import LLMChain
from app.recommendation import calculate_match
# pyrefly: ignore [missing-import]
from langchain.prompts import PromptTemplate

try:
    
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

class ResumeService:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def parse_resume_text(text: str) -> dict:
        """
        Structure resume text into JSON format using LLM or regex fallback.
        Returns:
            {
                "name": str,
                "email": str,
                "title": str,
                "experience_years": int,
                "skills": list[str]
            }
        """
        # If OpenAI API Key is configured and langchain available:
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key and LANGCHAIN_AVAILABLE:
            try:
        
                
                llm = ChatOpenAI(temperature=0.0, model_name="gpt-4o-mini", openai_api_key=api_key)
                
                template = """You are an expert resume parsing AI. Analyse the provided resume text and extract the details as a valid JSON object.
Do not include any extra introductory text, markdown code blocks, or comments in your response. Ensure the output is raw JSON only.

Resume text:
{resume_text}

JSON Format:
{{
  "name": "Full Name",
  "email": "emailAddress@example.com",
  "title": "Professional Title (e.g. Software Engineer)",
  "experience_years": 5,
  "skills": ["Skill1", "Skill2"]
}}"""
                
                prompt = PromptTemplate(template=template, input_variables=["resume_text"])
                chain = LLMChain(llm=llm, prompt=prompt)
                
                res = chain.run(resume_text=text)
                
                clean_res = res.strip()
                if clean_res.startswith("```"):
                    lines = clean_res.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].startswith("```"):
                        lines = lines[:-1]
                    clean_res = "\n".join(lines).strip()
                
                parsed = json.loads(clean_res)
                return {
                    "name": parsed.get("name", "Unknown Candidate"),
                    "email": parsed.get("email", ""),
                    "title": parsed.get("title", ""),
                    "experience_years": int(parsed.get("experience_years", 0)),
                    "skills": [s.strip() for s in parsed.get("skills", []) if s.strip()]
                }
            except Exception as e:
                pass

        # Rules-based Fallback Parser
        # 1. Regex Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else ""

        # 2. Extract Name (smarter heuristics)
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        name = ""
        BAD_NAME_KEYWORDS = {
            "engineer", "developer", "designer", "architect", "manager", "analyst", "administrator", "lead", 
            "specialist", "scientist", "programmer", "aspiring", "curriculum", "vitae", "resume", "cv", 
            "portfolio", "summary", "objective", "profile", "hiring", "experience", "education", "skills", 
            "projects", "contact", "phone", "email", "address", "phone:", "email:", "name:"
        }
        
        # Check first 8 lines
        for line in lines[:8]:
            clean_line = line
            if clean_line.lower().startswith("name:"):
                clean_line = clean_line[5:].strip()
            elif clean_line.lower().startswith("full name:"):
                clean_line = clean_line[10:].strip()
            
            words = clean_line.split()
            if not (1 <= len(words) <= 4) or len(clean_line) > 50:
                continue
            
            if "@" in clean_line:
                continue
                
            if any(lk in clean_line.lower() for lk in ["http", "www", ".com", ".org", "/"]):
                continue
                
            if any(char.isdigit() for char in clean_line):
                continue
                
            if any(w.lower() in BAD_NAME_KEYWORDS for w in words):
                continue
                
            name = clean_line
            break
            
        if not name:
            name = lines[0] if lines else "Unknown Candidate"

        # 3. Guess Title
        title = ""
        for line in lines[:8]:
            clean_line = line
            if clean_line.lower().startswith("title:"):
                title = clean_line[6:].strip()
                break
            elif clean_line.lower().startswith("role:"):
                title = clean_line[5:].strip()
                break
            elif any(term in line.lower() for term in ["engineer", "developer", "designer", "architect", "manager", "analyst", "administrator", "lead", "scientist", "recruiter", "programmer"]):
                title = line
                break
        if not title:
            title = "Software Engineer"

        # 4. Extract experience years
        exp_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s+)?(?:work\s+|professional\s+)?experience',
            r'(?:overall|total|work)\s+experience\s*[:\-]?\s*(\d+)',
            r'(\d+)\+?\s*years?\s*in\s+(?:software|development|engineering|industry|IT)',
            r'(\d+)\+?\s*years?\s*(?:of\s+)?exp'
        ]
        experience_years = None
        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                experience_years = int(match.group(1))
                break
        if experience_years is None:
            match = re.search(r'(\d+)\+?\s*years?', text, re.IGNORECASE)
            experience_years = int(match.group(1)) if match else 1

        # 5. Extract Skills from predefined dictionary
        skills_dictionary = [
            "python", "javascript", "typescript", "java", "c#", "c++", "go", "rust", "php", "ruby", "sql",
            "html", "css", "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask",
            "fastapi", "spring boot", "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes",
            "aws", "azure", "gcp", "git", "ci/cd", "agile", "scrum", "machine learning", "deep learning",
            "nlp", "data structures", "algorithms", "system design", "html5", "css3", "tailwindcss",
            "bootstrap", "graphql", "rest api", "junit", "pytest", "selenium", "jira", "figma"
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in skills_dictionary:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill.title() if len(skill) > 2 else skill.upper())

        return {
            "name": name,
            "email": email,
            "title": title,
            "experience_years": experience_years,
            "skills": found_skills or ["Python", "FastAPI", "React"]
        }

    @staticmethod
    def compare_resume_to_job(parsed_resume: dict, job: models.Job) -> dict:
        resume_skills_set = set(s.lower().strip() for s in parsed_resume["skills"])
        job_reqs_list = job.requirements or []
        
        matched_skills = []
        missing_skills = []
        for req in job_reqs_list:
            req_lower = req.strip().lower()
            if req_lower in resume_skills_set:
                matched_skills.append(req)
            else:
                missing_skills.append(req)
                
        user_exp = parsed_resume["experience_years"]
        job_exp = job.experience_level or 0
        
        skills_score = len(matched_skills) / len(job_reqs_list) if job_reqs_list else 1.0
        exp_score = 1.0 if user_exp >= job_exp else max(0.3, user_exp / job_exp if job_exp > 0 else 1.0)
        
        overall_score = (skills_score * 0.6) + (exp_score * 0.4)
        
        suggestions = []
        if missing_skills:
            suggestions.append(f"Add critical missing skills required by this role to your resume: {', '.join(missing_skills)}.")
        if user_exp < job_exp:
            suggestions.append(f"This role requests {job_exp} years of experiences, while your resume parsed {user_exp} years. Highlight any similar projects to bridge the gap.")
        if not suggestions:
            suggestions.append("Your skills and experience align perfectly with this role! Ensure your application highlights this fit.")

        match_score = int(overall_score * 100)
        if match_score >= 70:
            match_level = "Strong"
        elif match_score >= 40:
            match_level = "Medium"
        else:
            match_level = "Low"

        return {
            "match_score": match_score,
            "match_level": match_level,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "experience_status": "Strong Match" if user_exp >= job_exp else f"Requires {job_exp - user_exp} more years",
            "suggestions": suggestions
        }
