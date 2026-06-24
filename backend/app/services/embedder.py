import logging
from typing import List, Union
from sentence_transformers import SentenceTransformer
from app.core.config import settings

logger = logging.getLogger(__name__)

# Singleton wrapper for the embedding model to avoid loading it repeatedly
_embed_model_instance = None

def get_embedding_model() -> SentenceTransformer:
    global _embed_model_instance
    if _embed_model_instance is None:
        model_name = settings.EMBEDDING_MODEL
        logger.info(f"Loading SentenceTransformer model: {model_name}...")
        try:
            _embed_model_instance = SentenceTransformer(model_name)
            logger.info("SentenceTransformer model successfully loaded.")
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer model {model_name}: {e}")
            raise e
    return _embed_model_instance

class EmbeddingService:
    """Service for generating dense vector embeddings from text."""
    
    def __init__(self):
        self.model = get_embedding_model()

    def get_embedding(self, text: str) -> List[float]:
        """Generates a list of floats representing the embedding for a single text string."""
        if not text:
            raise ValueError("Input text for embedding cannot be empty.")
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise e

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        if not texts:
            return []
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise e
