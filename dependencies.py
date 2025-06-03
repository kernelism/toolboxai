from fastapi import Depends
from db.chroma import ChromaDBBase

# Use a singleton pattern to avoid creating multiple ChromaDB clients
_chroma_client = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = ChromaDBBase()
    return _chroma_client
