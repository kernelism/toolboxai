from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# create a model for fastapi request getting a pdf as a file, with file name
class FileInfo(BaseModel):
    file: bytes
    filename: str

class AskRequest(BaseModel):
    prompt: str
    context: str

class AskRequestNoContext(BaseModel):
    prompt: str
    title: str

class FileResponse(BaseModel):
    id: str
    title: str
    path: str
    size: str
    pages: int
    lastModified: datetime