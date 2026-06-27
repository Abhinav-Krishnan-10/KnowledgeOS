from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Header
from sqlmodel import Session
from app.db.database import get_session
from app.core.llm_factory import get_llm_provider
from app.services.vector_store import VectorStoreService
from app.services.embedder import EmbeddingService
from app.services.rag_engine import RAGEngine

router = APIRouter(prefix="/chat", tags=["chat"])

embedder = EmbeddingService()
vector_store = VectorStoreService(embedder)

@router.post("")
async def conversational_chat(
    query: str = Body(..., embed=True),
    limit: Optional[int] = Body(5),
    document_id: Optional[int] = Body(None),
    category_id: Optional[int] = Body(None),
    x_llm_provider: Optional[str] = Header(None),
    x_llm_api_key: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Answers user query by retrieving relevant document context chunks and querying the active LLM."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # Dynamically fetch configured LLM provider (Gemini, OpenAI, or Ollama)
        llm_provider = get_llm_provider(
            provider_name=x_llm_provider,
            api_key=x_llm_api_key
        )
        
        # Initialize RAG Engine
        rag_engine = RAGEngine(vector_store, llm_provider)
        
        # Query async
        result = await rag_engine.query_async(
            session=session,
            query_text=query,
            limit=limit,
            document_id=document_id,
            category_id=category_id
        )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Conversational chat error: {str(e)}"
        )
