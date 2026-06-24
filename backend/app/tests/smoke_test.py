import os
import sys

# Ensure backend directory is in the sys path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def smoke_test():
    print("==================================================")
    print("         KNOWLEDGEOS BACKEND SMOKE TEST            ")
    print("==================================================")
    
    print("\n[1/3] Testing Core Imports...")
    try:
        from app.core.config import settings
        from app.db.models import Category, Document, DocumentChunk, ChunkEmbedding, GeneratedContent, SearchHistory
        from app.db.database import init_db, get_session
        from app.services.doc_processor import DocumentProcessor
        from app.services.embedder import EmbeddingService
        from app.services.vector_store import VectorStoreService
        from app.services.rag_engine import RAGEngine
        from app.core.llm_factory import get_llm_provider
        print(" -> Imports: SUCCESS")
    except Exception as e:
        print(f" -> Imports: FAILED. Error: {e}")
        sys.exit(1)
        
    print("\n[2/3] Checking Configuration Settings...")
    print(f" -> Environment: {settings.ENV}")
    print(f" -> DB URL: {settings.DATABASE_URL}")
    print(f" -> LLM Provider: {settings.LLM_PROVIDER}")
    print(f" -> Embedding Model: {settings.EMBEDDING_MODEL}")
    print(f" -> Document Storage Dir: {settings.UPLOAD_DIR}")
    
    print("\n[3/3] Checking Mock Service Initialization...")
    try:
        # Check doc processor
        proc = DocumentProcessor()
        print(" -> Document Processor: Initialized successfully.")
        
        # We won't trigger SentenceTransformers load here since it downloads models and needs packages,
        # but we check if we can initialize LLM providers based on environment availability.
        provider_name = settings.LLM_PROVIDER.lower().strip()
        print(f" -> Validating LLM provider setup for: '{provider_name}'...")
        if provider_name == "gemini" and not settings.GEMINI_API_KEY:
            print(" -> Warning: GEMINI_API_KEY is not set in environment.")
        elif provider_name == "openai" and not settings.OPENAI_API_KEY:
            print(" -> Warning: OPENAI_API_KEY is not set in environment.")
        elif provider_name == "ollama":
            print(f" -> Ollama configuration pointing to: {settings.OLLAMA_BASE_URL} (Model: {settings.OLLAMA_MODEL})")
            
        print(" -> Service initialization checks: SUCCESS")
    except Exception as e:
        print(f" -> Service checks: FAILED. Error: {e}")
        sys.exit(1)

    print("\n==================================================")
    print("        SMOKE TEST COMPLETED SUCCESSFULLY!        ")
    print("==================================================")

if __name__ == "__main__":
    smoke_test()
