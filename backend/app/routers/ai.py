from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])

class MessageInput(BaseModel):
    message: str

@router.post("/chat")
def ai_chat(payload: MessageInput, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    service = AIService(db, current_user)
    answer = service.chat(payload.message)
    return {"response": answer}
