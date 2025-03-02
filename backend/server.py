import logging
import os
import requests
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path

import models
import utils
import llm_handler

from config import settings

app = FastAPI(title="Document Server API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/documents", response_model=List[models.DocumentInfo])
async def get_documents():
    try:
        documents = utils.scan_documents_directory(settings.DOCUMENTS_DIR)
        return documents
    except Exception as e:
        logger.error(f"Error scanning documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """Serve the PDF file based on the given document ID"""
    documents = utils.scan_documents_directory(settings.DOCUMENTS_DIR)
    document = next((doc for doc in documents if doc.id == doc_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(document.path, media_type="application/pdf", filename=document.title)

@app.post("/ask")
async def ask(request: models.AskRequest):
    """Handles user questions and fetches responses from LLM."""
    answer = llm_handler.send_llm_request(request)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn

    Path(settings.DOCUMENTS_DIR).mkdir(exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=8080)