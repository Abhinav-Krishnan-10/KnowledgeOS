from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session
from app.db.database import get_session
from app.db.models import SearchHistory
from app.services.vector_store import VectorStoreService
from app.services.embedder import EmbeddingService

router = APIRouter(prefix="/search", tags=["search"])

embedder = EmbeddingService()
vector_store = VectorStoreService(embedder)

@router.post("")
async def search_knowledge_base(
    query: str = Body(..., embed=True),
    limit: Optional[int] = Body(5),
    document_id: Optional[int] = Body(None),
    category_id: Optional[int] = Body(None),
    session: Session = Depends(get_session)
):
    """Executes semantic similarity search on the pgvector knowledge base."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # Search similar chunks
        results = vector_store.search_similar_chunks(
            session=session,
            query=query,
            limit=limit,
            document_id=document_id,
            category_id=category_id
        )
        
        # Save search to history
        history = SearchHistory(
            query=query,
            results_count=len(results)
        )
        session.add(history)
        session.commit()
        
        # Format output
        output_results = []
        for chunk, score in results:
            output_results.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "document_name": chunk.document.name if chunk.document else "Unknown",
                "text": chunk.text,
                "chunk_index": chunk.chunk_index,
                "similarity_score": score
            })
            
        return {
            "query": query,
            "results": output_results
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Semantic search failed: {str(e)}"
        )
