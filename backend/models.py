from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ConversationMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = datetime.now()

# create a model for fastapi request getting a pdf as a file, with file name
class FileInfo(BaseModel):
    file: bytes
    filename: str

class AskRequest(BaseModel):
    prompt: str
    context: str
    conversation_id: Optional[str] = None

class AskRequestNoContext(BaseModel):
    prompt: str
    title: str
    conversation_id: Optional[str] = None

class FileResponse(BaseModel):
    id: str
    title: str
    path: str
    size: str
    pages: int
    lastModified: datetime

class ConversationResponse(BaseModel):
    conversation_id: str
    message: str
    history: List[ConversationMessage]