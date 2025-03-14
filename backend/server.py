import logging
import os
import time
import mimetypes
from pathlib import Path
from typing import List
from models import DocumentInfo
import uuid


from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

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

# Ensure document directory exists
Path(settings.DOCUMENTS_DIR).mkdir(parents=True, exist_ok=True)


@app.get("/documents", response_model=List[models.DocumentInfo])
async def get_documents():
    """Returns a list of all available documents."""
    try:
        documents = utils.scan_documents_directory(settings.DOCUMENTS_DIR)
        return documents
    except Exception as e:
        logger.error(f"Error scanning documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """Serves a PDF file based on the given document ID."""
    documents = utils.scan_documents_directory(settings.DOCUMENTS_DIR)
    document = next((doc for doc in documents if doc.id == doc_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(document.path, media_type="application/pdf", filename=document.title)


@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """PDF Upload endpoint."""
    try:
        mimetype, _ = mimetypes.guess_type(file.filename)
        if mimetype != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs are allowed.")
        original_filename = file.filename
        file_path = os.path.join(settings.DOCUMENTS_DIR, original_filename)
        file_bytes = await file.read()
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        unique_id = str(uuid.uuid4())[:8]
        file_size = f"{round(len(file_bytes) / 1024, 2)} KB"
        document_info = DocumentInfo.create(
            id=unique_id,
            title=original_filename,
            path=file_path,
            size=file_size
        )
        logger.info(f"PDF uploaded: {original_filename} (ID: {unique_id})")
        return {"success": True, "message": "File uploaded successfully", "document": document_info.dict()}

    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Error uploading file.")


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """PDF Delete endpoint."""
    try:
        documents = utils.scan_documents_directory(settings.DOCUMENTS_DIR)
        document = next((doc for doc in documents if doc.id == doc_id), None)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found.")
        file_path = document.path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server.")
        os.remove(file_path)
        logger.info(f"PDF deleted: {document.title} (ID: {doc_id})")
        return {"success": True, "message": "File deleted successfully", "id": doc_id}

    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Error deleting file.")



@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/ask")
async def ask(request: models.AskRequest):
    """Handles user questions and fetches responses from LLM."""
    answer = llm_handler.send_llm_request(request)
    return {"answer": answer}


if __name__ == "__main__":
    import uvicorn

    Path(settings.DOCUMENTS_DIR).mkdir(exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=8080)
