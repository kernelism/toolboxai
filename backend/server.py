import logging
import shutil
import uuid
from datetime import datetime
import os

from fastapi.exceptions import RequestValidationError
import fitz

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path

import models
from config import settings
from db.chroma import ChromaDBBase
from dependencies import get_chroma_client
from context_handlers.llm_handler import LLMHandler

app = FastAPI(title="Document Server API")

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

# TODO: need api for doc upload
"""
This API will essentially upload and return success on save and 
will asynchronously process the document in the background. 
It will do the topic checks, split by page and save doc text in chroma
"""
@app.post("/upload", response_model=models.FileResponse)
async def upload_pdf(
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
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info("File is uploaded to dir")
        
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            file_size = os.path.getsize(file_path)
            size_str = f"{file_size / 1024 / 1024:.2f} MB" if file_size > 1024 * 1024 else f"{file_size / 1024:.2f} KB"
            
            chroma_db.add_document(file_path)
            
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
            raise HTTPException(status_code=422, detail=f"Error processing PDF: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

# TODO: need api for query with context selected
"""
Nothing to do with data store here,
just call LLM with the query and context selected
"""
@app.post("/query")
async def query_document(query_info: models.AskRequest):
    """
    Query the document with context
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
@app.post("/ask")
async def ask_question(query_info: models.AskRequestNoContext, 
                       db: ChromaDBBase = Depends(get_chroma_client)):
    """
    Ask a question with the full document as context
    """
    results = db.query(query_text=query_info.prompt, doc_id=query_info.title)
    query = models.AskRequest(
        prompt=query_info.prompt,
        context=" ".join([result.page_text for result in results])
    )
    response = LLMHandler().send_llm_request(request=query)
    return JSONResponse(content=response, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)