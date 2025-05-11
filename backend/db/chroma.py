from chromadb.api.models.Collection import Collection
import chromadb
from typing import List
import uuid
import fitz  # PyMuPDF
from context_handlers.llm_handler import LLMHandler
from db.models import PageTitles
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChromaDBBase:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="chroma_db")
        self.collection = self.client.get_or_create_collection(name="documents")
        self.llm = LLMHandler()

    def load_pdf_pages(self, pdf_path: str) -> List[str]:
        doc = fitz.open(pdf_path)
        return [page.get_text() for page in doc]
    
    def sanitize_metadata(self, metadata: dict) -> dict:
        sanitized = {}
        for key, value in metadata.items():
            if isinstance(value, (str, int, float, bool)):
                sanitized[key] = value
            elif isinstance(value, list):
                sanitized[key] = ", ".join(map(str, value))  # Convert list to comma-separated string
            else:
                sanitized[key] = str(value)  # Fallback to string conversion
        return sanitized
    
    def add_document(self, pdf_path: str):
        doc_id = pdf_path.split("/")[-1]
        pages = self.load_pdf_pages(pdf_path)
        for idx, text in enumerate(pages):
            page_data = PageTitles(page_number=idx + 1, page_text=text)
            
            metadata_dict = page_data.dict() if hasattr(page_data, 'dict') else page_data.model_dump()
            metadata_dict["doc_id"] = doc_id

            sanitized_metadata = self.sanitize_metadata(metadata_dict)

            self.collection.add(
                documents=[page_data.page_text],
                metadatas=[sanitized_metadata],
                ids=[str(uuid.uuid4())],
            )

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

