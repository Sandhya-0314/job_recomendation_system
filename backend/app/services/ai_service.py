import os
import json
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from .. import models
from ..recommendation import calculate_match
# pyrefly: ignore [missing-import]
from langchain_community.chat_models import ChatOpenAI
# pyrefly: ignore [missing-import]
from langchain.chains import LLMChain
# pyrefly: ignore [missing-import]
from langchain.prompts import PromptTemplate
# Detect LangChain presence
try:
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

class AIService:
    def __init__(self, db: Session, user: models.User):
        self.db = db
        self.user = user

    def _get_context(self):
        # 1. Fetch user data details
        user_info = {
            "name": self.user.name,
            "title": self.user.title,
            "skills": self.user.skills,
            "experience": self.user.experience_years,
            "preferences": self.user.preferences
        }

        # 2. Fetch jobs matched rankings
        jobs = self.db.query(models.Job).all()
        jobs_list = []
        for j in jobs:
            match_details = calculate_match(self.user, j)
            jobs_list.append({
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "type": j.type,
                "requirements": j.requirements,
                "experience_level": j.experience_level,
                "match_score": match_details["score"]
            })
            
        # Sort jobs by match score
        jobs_list.sort(key=lambda x: x["match_score"], reverse=True)

        # 3. Fetch user submitted applications
        apps = self.db.query(models.Application).filter(models.Application.user_id == self.user.id).all()
        apps_list = []
        for app in apps:
            job = self.db.query(models.Job).filter(models.Job.id == app.job_id).first()
            if job:
                apps_list.append({
                    "job_title": job.title,
                    "company": job.company,
                    "status": app.status,
                    "applied_date": str(app.applied_date.date()) if app.applied_date else "N/A"
                })

        # 4. Fetch bookmarked jobs
        bookmarks = self.db.query(models.Bookmark).filter(models.Bookmark.user_id == self.user.id).all()
        bookmarks_list = []
        for b in bookmarks:
            job = self.db.query(models.Job).filter(models.Job.id == b.job_id).first()
            if job:
                bookmarks_list.append({
                    "title": job.title,
                    "company": job.company
                })

        return {
            "user": user_info,
            "jobs": jobs_list,
            "applications": apps_list,
            "bookmarks": bookmarks_list
        }

    def chat(self, message: str) -> str:
        ctx = self._get_context()
        query_lower = message.lower()

        # If LLM API Key is configured in environment, use actual LangChain + Model
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key and LANGCHAIN_AVAILABLE:
            try:
                # We can dynamically initialize a LangChain ChatOpenAI call
               
                
                llm = ChatOpenAI(temperature=0.7, model_name="gpt-4o-mini", openai_api_key=api_key)
                
                template = """You are helpful career assistant AI for the Job Recommendation portal.
You have access to the user's database records:
User Profile: {user_profile}
Current User Bookmarks: {username_bookmarks}
Current User Applications Status: {user_applications}
Available Vacancies & Match Scores: {vacancies}

Answer the candidate query accurately. Cite specific details from the database provided.
Candidate Question: {question}
Answer:"""
                
                prompt = PromptTemplate(
                    template=template, 
                    input_variables=["user_profile", "username_bookmarks", "user_applications", "vacancies", "question"]
                )
                chain = LLMChain(llm=llm, prompt=prompt)
                
                res = chain.run(
                    user_profile=json.dumps(ctx["user"]),
                    username_bookmarks=json.dumps(ctx["bookmarks"]),
                    user_applications=json.dumps(ctx["applications"]),
                    vacancies=json.dumps(ctx["jobs"][:5]),  # Top 5 jobs
                    question=message
                )
                return res
            except Exception as e:
                # Fallback to native router on execution issues
                pass

        # NATIVE SEMANTIC ROUTER (RAG FALLBACK)
        # 1. Ask about applications status
        if any(w in query_lower for w in ["application", "applied", "status", "interview", "offer", "rejected"]):
            if not ctx["applications"]:
                return f"Hi {ctx['user']['name']}, I checked the database and you haven't submitted any job applications yet. Head over to the 'Explore Jobs' tab to apply!"
            
            resp = f"Sure! I found {len(ctx['applications'])} applications in the database for you:\n\n"
            for app in ctx["applications"]:
                resp += f"• **{app['job_title']}** at *{app['company']}* — Status: `{app['status']}` (Applied: {app['applied_date']})\n"
            return resp

        # 2. Ask about bookmarks
        if any(w in query_lower for w in ["bookmark", "saved", "favorite"]):
            if not ctx["bookmarks"]:
                return "You don't have any bookmarked jobs yet. You can bookmark vacancies you like under the 'Explore Jobs' tab!"
            
            resp = f"Here are your bookmarked jobs:\n\n"
            for b in ctx["bookmarks"]:
                resp += f"• **{b['title']}** at *{b['company']}*\n"
            return resp

        # 3. Ask about recommendations
        if any(w in query_lower for w in ["recommendation", "recommend", "best matches", "suggest", "matching", "match"]):
            if not ctx["jobs"]:
                return "There are no jobs currently available in the database to recommend."
            
            top_jobs = ctx["jobs"][:3]
            resp = f"Hi {ctx['user']['name']}, based on your title **{ctx['user']['title']}** and skills ({', '.join(ctx['user']['skills'])}), I found these top recommendations for you:\n\n"
            for i, job in enumerate(top_jobs, 1):
                resp += f"{i}. **{job['title']}** at *{job['company']}*\n"
                resp += f"   • Location: {job['location']} ({job['type']})\n"
                resp += f"   • Match Score: **{job['match_score']:.1f}%**\n"
                resp += f"   • Requirements: {', '.join(job['requirements'])}\n"
            resp += "\nYou can apply directly for these positions in the 'Explore Jobs' or 'Dashboard' tabs!"
            return resp

        # 4. Ask about specific jobs
        if any(w in query_lower for w in ["roles", "jobs", "vacancies", "positions", "hiring", "opportunities"]):
            if not ctx["jobs"]:
                return "There are no active openings in our database right now."
            
            resp = "Here are the jobs currently in our database, sorted by your match compatibility:\n\n"
            for job in ctx["jobs"][:4]:
                resp += f"• **{job['title']}** at *{job['company']}* (Score: **{job['match_score']:.1f}%**) — {job['location']} ({job['type']})\n"
            resp += "\nFeel free to ask me for more details on any of these roles."
            return resp

        # 5. Default welcoming response giving context overview
        resp = f"Hello {ctx['user']['name']}! I am your Careers AI Assistant. I can help search our database or give recommendations.\n\n"
        resp += f"Currently, I see in your profile:\n"
        resp += f"• **Role**: {ctx['user']['title']}\n"
        resp += f"• **Skills**: {', '.join(ctx['user']['skills'])}\n"
        resp += f"• **Applications**: {len(ctx['applications'])} active submissions\n"
        resp += f"• **Bookmarks**: {len(ctx['bookmarks'])} saved items\n\n"
        resp += "Try asking me:\n"
        resp += "- *'What recommendations do you have for me?'*\n"
        resp += "- *'What is the status of my applications?'*\n"
        resp += "- *'Show me my bookmarked jobs'*."
        return resp
