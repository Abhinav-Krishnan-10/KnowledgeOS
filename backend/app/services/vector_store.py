import logging
from typing import List, Tuple, Optional
from sqlmodel import Session, select
from app.db.models import DocumentChunk, Document
from app.services.embedder import EmbeddingService

logger = logging.getLogger(__name__)

class VectorStoreService:
    """Mock Service for interacting with pgvector in the database to index and search embeddings."""
    
    def __init__(self, embedder: EmbeddingService):
        self.embedder = embedder

    def save_document_embeddings(self, session: Session, document_id: int, chunks: List[str]) -> None:
        logger.info(f"Mock saving {len(chunks)} chunks/embeddings for document_id={document_id}")
        try:
            # Create mock chunks in the database so that DB foreign keys remain valid
            for i, text in enumerate(chunks):
                chunk = DocumentChunk(
                    document_id=document_id,
                    text=text,
                    chunk_index=i
                )
                session.add(chunk)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Mock saving failed: {e}")
            raise e

    def search_similar_chunks(
        self,
        session: Session,
        query: str,
        limit: int = 5,
        document_id: Optional[int] = None,
        category_id: Optional[int] = None
    ) -> List[Tuple[DocumentChunk, float]]:
        logger.info(f"Mock similarity search for query: '{query}'")
        try:
            # Return first few matching chunks in the database to keep endpoint flows working
            statement = select(DocumentChunk)
            if document_id is not None:
                statement = statement.where(DocumentChunk.document_id == document_id)
            statement = statement.limit(limit)
            chunks = session.exec(statement).all()
            
            # Return chunk with mock similarity score of 0.95
            return [(chunk, 0.95) for chunk in chunks]
        except Exception as e:
            logger.error(f"Mock search failed: {e}")
            raise e
