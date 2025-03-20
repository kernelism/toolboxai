from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentInfo(BaseModel):
    id: str
    title: str
    path: str
    size: str
    pages: Optional[int] = None
    lastModified: str

    @classmethod
    def create(cls, id: str, title: str, path: str, size: str) -> "DocumentInfo":
        """idk wtf is this db but this is trash. gotta make a db for this"""
        return cls(
            id=id,
            title=title,
            path=path,
            size=size,
            lastModified=datetime.now().isoformat()
        )

class AskRequest(BaseModel):
    prompt: str
    selectedText: str