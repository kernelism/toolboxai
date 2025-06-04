from chromadb.api.models.Collection import Collection
import chromadb
from typing import List
import uuid
import fitz  # PyMuPDF
from context_handlers.llm_handler import LLMHandler
from db.models import PageTitles
import logging
from concurrent.futures import ThreadPoolExecutor
import asyncio
import os
import shutil

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChromaDBBase:
    def __init__(self):
        self.db_path = "data/chroma_db"
        # Ensure the directory exists
        os.makedirs(self.db_path, exist_ok=True)
        
        try:
            self.client = chromadb.PersistentClient(path=self.db_path)
            self.collection = self.client.get_or_create_collection(name="documents")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {e}")
            # If there's an error, try to reset the database
            if os.path.exists(self.db_path):
                shutil.rmtree(self.db_path)
                os.makedirs(self.db_path)
            self.client = chromadb.PersistentClient(path=self.db_path)
            self.collection = self.client.get_or_create_collection(name="documents")
        
        self.llm = LLMHandler()
        self.thread_pool = ThreadPoolExecutor(max_workers=4)

    def load_pdf_pages(self, pdf_path: str) -> List[str]:
        """Load PDF pages with optimized text extraction"""
        doc = fitz.open(pdf_path)
        pages = []
        for page in doc:
            # Extract text with optimized settings
            text = page.get_text("text", sort=True)
            # Clean up text
            text = " ".join(text.split())  # Remove extra whitespace
            pages.append(text)
        return pages
    
    def process_page_batch(self, pages: List[str], doc_id: str, start_idx: int) -> List[tuple]:
        """Process a batch of pages and return their metadata"""
        batch_data = []
        for idx, text in enumerate(pages):
            page_num = start_idx + idx + 1
            page_data = PageTitles(page_number=page_num, page_text=text)
            metadata_dict = page_data.dict() if hasattr(page_data, 'dict') else page_data.model_dump()
            metadata_dict["doc_id"] = doc_id
            sanitized_metadata = self.sanitize_metadata(metadata_dict)
            batch_data.append((text, sanitized_metadata, str(uuid.uuid4())))
        return batch_data
    
    def sanitize_metadata(self, metadata: dict) -> dict:
        sanitized = {}
        for key, value in metadata.items():
            if isinstance(value, (str, int, float, bool)):
                sanitized[key] = value
            elif isinstance(value, list):
                sanitized[key] = ", ".join(map(str, value))
            else:
                sanitized[key] = str(value)
        return sanitized
    
    def add_document(self, pdf_path: str):
        """Add document to ChromaDB with optimized processing"""
        doc_id = pdf_path.split("/")[-1]
        pages = self.load_pdf_pages(pdf_path)
        
        # Process pages in batches
        batch_size = 10  # Adjust based on your needs
        for i in range(0, len(pages), batch_size):
            batch = pages[i:i + batch_size]
            batch_data = self.process_page_batch(batch, doc_id, i)
            
            # Prepare batch data
            documents = [data[0] for data in batch_data]
            metadatas = [data[1] for data in batch_data]
            ids = [data[2] for data in batch_data]
            
            # Add batch to collection
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added batch {i//batch_size + 1} of {(len(pages) + batch_size - 1)//batch_size} for document {doc_id}")

    def delete_document_by_doc_id(self, doc_id: str):
        results = self.collection.get(where={"doc_id": doc_id})
        ids_to_delete = results.get("ids", [])
        if ids_to_delete:
            self.collection.delete(ids=ids_to_delete)

    def query(self, query_text: str, doc_id: str = None, n_results: int = 5) -> List[PageTitles]:
        where_filter = {"doc_id": doc_id} if doc_id else {}

        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_filter
        )

        page_titles_list = []
        for metadata in results.get('metadatas', [[]])[0]:
            if metadata:
                titles = metadata.get("titles")
                if isinstance(titles, str):
                    metadata["titles"] = [titles] if titles.strip() else None
                elif titles is None:
                    metadata["titles"] = None
                elif not isinstance(titles, list):
                    metadata["titles"] = None

                page_titles_list.append(PageTitles(**metadata))

        return page_titles_list

