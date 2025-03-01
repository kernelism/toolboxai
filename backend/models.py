from pydantic import BaseModel
from typing import Optional

class DocumentInfo(BaseModel):
    id: str
    title: str
    path: str
    size: str
    pages: Optional[int] = None
    lastModified: str

class AskRequest(BaseModel):
    prompt: str
    selectedText: str
