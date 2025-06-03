import logging
import shutil
import uuid
from datetime import datetime
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi.exceptions import RequestValidationError
import fitz

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path

import models
from config import settings
from db.chroma import ChromaDBBase
from dependencies import get_chroma_client
from context_handlers.llm_handler import LLMHandler
from context_handlers.conversation_store import conversation_store

app = FastAPI(title="Document Server API")

# Create a thread pool for CPU-intensive tasks
thread_pool = ThreadPoolExecutor(max_workers=4)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.info(exc.errors()) 
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

async def process_pdf(file_path: str, chroma_db: ChromaDBBase):
    """Process PDF in background"""
    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        file_size = os.path.getsize(file_path)
        
        # Process PDF in a thread pool to avoid blocking
        await asyncio.get_event_loop().run_in_executor(
            thread_pool,
            chroma_db.add_document,
            file_path
        )
        
        logger.info(f"Successfully processed PDF: {file_path}")
    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

@app.post("/upload", response_model=models.FileResponse)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chroma_db: ChromaDBBase = Depends(get_chroma_client)
):
    # Validate file is a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.DOCUMENTS_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info("File is uploaded to dir")
        
        # Get basic file info
        doc = fitz.open(file_path)
        page_count = len(doc)
        file_size = os.path.getsize(file_path)
        size_str = f"{file_size / 1024 / 1024:.2f} MB" if file_size > 1024 * 1024 else f"{file_size / 1024:.2f} KB"
        
        # Add PDF processing to background tasks
        background_tasks.add_task(process_pdf, file_path, chroma_db)
        
        return models.FileResponse(
            id=file_id,
            title=file.filename,
            path=file_path,
            size=size_str,
            pages=page_count,
            lastModified=datetime.now().isoformat()
        )
            
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

# TODO: need api for query with context selected
"""
Nothing to do with data store here,
just call LLM with the query and context selected
"""
@app.post("/query", response_model=models.ConversationResponse)
async def query_document(query_info: models.AskRequest):
    """
    Query the document with context and handle conversation history
    """
    return LLMHandler().send_llm_request(request=query_info)

# TODO: need api for doc delete
@app.delete("/delete")
async def delete_document(file_info: models.FileInfo, 
                           db: ChromaDBBase = Depends(get_chroma_client)):
    """
    Delete a document
    """
    file_path = Path(settings.DOCUMENTS_DIR) / file_info.filename
    if file_path.exists():
        file_path.unlink()
        logger.info(f"File deleted from {file_path}")
        db.delete_document_by_doc_id(file_info.filename)
        logger.info(f"Document {file_info.filename} deleted from database")
        return JSONResponse(content={"message": "File deleted successfully"}, status_code=200)
    else:
        return JSONResponse(content={"message": "File not found"}, status_code=404)


# TODO: need api for return list of docs 
@app.get("/documents", response_model=list[models.FileResponse])
async def list_documents():
    """
    List all documents in structured format
    """
    documents = []
    for file in Path(settings.DOCUMENTS_DIR).iterdir():
        if file.is_file() and file.suffix == ".pdf":
            try:
                doc = fitz.open(file)
                page_count = len(doc)
                file_size = file.stat().st_size
                size_str = f"{file_size / 1024 / 1024:.2f} MB" if file_size > 1024 * 1024 else f"{file_size / 1024:.2f} KB"
                
                documents.append(models.FileResponse(
                    id=str(uuid.uuid5(uuid.NAMESPACE_OID, file.name)),
                    title=file.name,
                    path=str(file),
                    size=size_str,
                    pages=page_count,
                    lastModified=datetime.fromtimestamp(file.stat().st_mtime).isoformat()
                ))
            except Exception as e:
                continue  # skip unreadable files
    return documents

# TODO: need api for returning specific doc as pdf info
@app.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """
    Get a specific document
    """
    file_path = Path(settings.DOCUMENTS_DIR) / doc_id
    if file_path.exists():
        return FileResponse(file_path)
    else:
        return JSONResponse(content={"message": "File not found"}, status_code=404)

# TODO: need api for asking question with full pdf as context
"""
need to use llm_handler to get the context and then call LLM with the query
and that context
"""
@app.post("/ask", response_model=models.ConversationResponse)
async def ask_question(query_info: models.AskRequestNoContext, 
                       db: ChromaDBBase = Depends(get_chroma_client)):
    """
    Ask a question with the full document as context and handle conversation history
    """
    results = db.query(query_text=query_info.prompt, doc_id=query_info.title)
    query = models.AskRequest(
        prompt=query_info.prompt,
        context=" ".join([result.page_text for result in results]),
        conversation_id=query_info.conversation_id
    )
    return LLMHandler().send_llm_request(request=query)

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and its history
    """
    try:
        conversation_store.delete_conversation(conversation_id)
        return JSONResponse(content={"message": "Conversation deleted successfully"}, status_code=200)
    except ValueError as e:
        return JSONResponse(content={"message": str(e)}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=9766, reload=True, factory=False)