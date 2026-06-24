import logging
from typing import List

logger = logging.getLogger(__name__)

class RecursiveCharacterTextSplitter:
    """Mock lightweight recursive character text splitter."""
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200, separators: List[str] = None):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", " ", ""]

    def split_text(self, text: str) -> List[str]:
        # Basic mock split on newlines
        return [p.strip() for p in text.split("\n") if p.strip()]

class DocumentProcessor:
    """Mock Service for parsing documents, clean text, and chunk content."""
    
    def __init__(self):
        logger.info("Initializing Mock Document Processor...")
        self.text_splitter = RecursiveCharacterTextSplitter()

    def clean_text(self, text: str) -> str:
        return text.strip()

    def process_document(self, file_path: str) -> str:
        logger.info(f"Mock processing file path: {file_path}")
        return f"This is mock document content extracted from the file: {file_path}"

    def chunk_text(self, text: str) -> List[str]:
        return ["Mock Chunk 1: " + text, "Mock Chunk 2: " + text]
