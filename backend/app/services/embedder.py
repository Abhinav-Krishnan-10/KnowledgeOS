import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Mock Service for generating dense vector embeddings from text."""
    
    def __init__(self):
        logger.info("Initializing Mock Embedding Service (Developer handoff stub)...")

    def get_embedding(self, text: str) -> List[float]:
        """Generates a list of floats representing the embedding for a single text string."""
        if not text:
            raise ValueError("Input text for embedding cannot be empty.")
        # Return 384 dimensions of zeros to keep pgvector float validation happy
        return [0.0] * 384

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        if not texts:
            return []
        return [[0.0] * 384 for _ in texts]
