from pydantic import BaseModel
from typing import List, Optional

class PageTitles(BaseModel):
    page_number: int
    titles: Optional[List[str]] = None
    page_text: str
