import os
import time
import mimetypes
import fitz
import json

from server import logger
import models

def load_dblp_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]

def format_size(size_bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0 or unit == 'GB':
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0

def get_pdf_page_count(file_path):
    try:
        with fitz.open(file_path) as doc:
            return doc.page_count
    except Exception as e:
        logger.error(f"Error getting page count for {file_path}: {e}")
        return None

def scan_documents_directory(DOCUMENTS_DIR):
    """Scan the documents directory and return information about PDF files"""
    documents = []
    doc_id = 1

    if not os.path.exists(DOCUMENTS_DIR):
        logger.warning(f"Documents directory {DOCUMENTS_DIR} not found. Creating it...")
        os.makedirs(DOCUMENTS_DIR)
        return documents

    for root, _, files in os.walk(DOCUMENTS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            file_path = os.path.abspath(file_path)
            
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type != 'application/pdf':
                continue
                
            file_stats = os.stat(file_path)
            size = format_size(file_stats.st_size)
            last_modified = time.strftime('%Y-%m-%dT%H:%M:%S', 
                                         time.localtime(file_stats.st_mtime))
            
            pages = get_pdf_page_count(file_path)
            
            documents.append(models.DocumentInfo(
                id=str(doc_id),
                title=file,
                path=file_path.replace('\\', '/'),
                size=size,
                pages=pages,
                lastModified=last_modified
            ))
            doc_id += 1
    
    return documents
