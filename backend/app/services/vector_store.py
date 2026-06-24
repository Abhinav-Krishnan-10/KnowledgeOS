import logging
from typing import List, Tuple, Optional
from sqlmodel import Session, select
from app.db.models import Document, DocumentChunk, ChunkEmbedding
from app.services.embedder import EmbeddingService

logger = logging.getLogger(__name__)

class VectorStoreService:
    """Service for interacting with pgvector in the database to index and search embeddings."""
    
    def __init__(self, embedder: EmbeddingService):
        self.embedder = embedder

    def save_document_embeddings(self, session: Session, document_id: int, chunks: List[str]) -> None:
        if not chunks:
            logger.warning(f"No chunks provided to save for document_id={document_id}")
            return
        try:
            embeddings = self.embedder.get_embeddings(chunks)
            for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                chunk = DocumentChunk(
                    document_id=document_id,
                    text=chunk_text,
                    chunk_index=i
                )
                session.add(chunk)
                session.flush()
                
                chunk_embedding = ChunkEmbedding(
                    chunk_id=chunk.id,
                    embedding=embedding
                )
                session.add(chunk_embedding)
            session.commit()
            logger.info(f"Successfully saved {len(chunks)} chunks/embeddings for document_id={document_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to save embeddings for document_id={document_id}: {e}")
            raise e

    def search_similar_chunks(
        self,
        session: Session,
        query: str,
        limit: int = 5,
        document_id: Optional[int] = None,
        category_id: Optional[int] = None
    ) -> List[Tuple[DocumentChunk, float]]:
        try:
            query_embedding = self.embedder.get_embedding(query)
            distance_expr = ChunkEmbedding.embedding.cosine_distance(query_embedding).label("distance")
            
            statement = select(DocumentChunk, distance_expr).join(
                ChunkEmbedding, ChunkEmbedding.chunk_id == DocumentChunk.id
            ).join(
                Document, Document.id == DocumentChunk.document_id
            )
            
            if document_id is not None:
                statement = statement.where(DocumentChunk.document_id == document_id)
            if category_id is not None:
                statement = statement.where(Document.category_id == category_id)
                
            statement = statement.order_by(distance_expr).limit(limit)
            results = session.exec(statement).all()
            
            formatted_results = []
            for chunk, distance in results:
                dist_val = float(distance) if distance is not None else 1.0
                similarity_score = 1.0 - dist_val
                formatted_results.append((chunk, similarity_score))
                
            return formatted_results
        except Exception as e:
            logger.error(f"Error executing vector similarity search: {e}")
            raise e
