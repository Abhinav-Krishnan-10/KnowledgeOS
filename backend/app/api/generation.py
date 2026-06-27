import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Header
from sqlmodel import Session
from app.db.database import get_session
from app.db.models import GeneratedContent, DocumentChunk, Document
from app.core.llm_factory import get_llm_provider
from app.services.vector_store import VectorStoreService
from app.services.embedder import EmbeddingService

router = APIRouter(prefix="/generation", tags=["generation"])

logger = logging.getLogger(__name__)

embedder = EmbeddingService()
vector_store = VectorStoreService(embedder)

@router.post("/create")
async def generate_content(
    content_type: str = Body(...),  # resume, project_description, portfolio, report, presentation
    instructions: str = Body(...),  # details on what kind of content to output
    document_ids: Optional[List[int]] = Body(None),  # optional list of documents to ground the output
    x_llm_provider: Optional[str] = Header(None),
    x_llm_api_key: Optional[str] = Header(None),
    session: Session = Depends(get_session)
):
    """Generates new personalized content grounded in the uploaded files context matching instructions."""
    if not instructions.strip():
        raise HTTPException(status_code=400, detail="Instructions cannot be empty.")
        
    try:
        context_blocks = []
        
        # Ground content in specific documents if specified
        if document_ids:
            for doc_id in document_ids:
                doc = session.get(Document, doc_id)
                if not doc:
                    continue
                    
                # Search relevant context within this document matching instructions
                chunks_with_scores = vector_store.search_similar_chunks(
                    session=session,
                    query=instructions,
                    limit=10,
                    document_id=doc_id
                )
                
                for chunk, score in chunks_with_scores:
                    context_blocks.append(
                        f"--- SOURCE CHUNK ({doc.name}) ---\n"
                        f"{chunk.text}\n"
                        f"--- END SOURCE CHUNK ---"
                    )
        else:
            # If no document_ids are passed, run search across the entire knowledge base
            chunks_with_scores = vector_store.search_similar_chunks(
                session=session,
                query=instructions,
                limit=15
            )
            for chunk, score in chunks_with_scores:
                doc_name = chunk.document.name if chunk.document else "Unknown Doc"
                context_blocks.append(
                    f"--- SOURCE CHUNK ({doc_name}) ---\n"
                    f"{chunk.text}\n"
                    f"--- END SOURCE CHUNK ---"
                )
                
        context_str = "\n\n".join(context_blocks)
        
        llm = get_llm_provider(
            provider_name=x_llm_provider,
            api_key=x_llm_api_key
        )
        system_instruction = (
            "You are a professional content writer. Your task is to generate clean, professional, "
            "and highly styled document materials. You MUST base your content heavily on the provided "
            "source chunks (which represent the user's personal portfolio, reports, resume details, or projects) "
            "to make the response deeply personalized and accurate."
        )
        
        prompt = (
            f"Generate a document of type '{content_type}' following these instructions:\n"
            f"Instructions:\n{instructions}\n\n"
            f"Grounded Context from User's Knowledge Base:\n"
            f"{context_str if context_str else '[No matching context chunks found]'}\n\n"
            f"Format the output using beautiful markdown styling. Generate the content now:"
        )
        
        generated_text = await llm.generate_async(prompt, system_instruction)
        
        result_data = {
            "content_type": content_type,
            "instructions": instructions,
            "document_ids": document_ids,
            "content": generated_text
        }
        
        # Save to database (use first document_id as primary link if list is provided)
        primary_doc_id = document_ids[0] if (document_ids and len(document_ids) > 0) else None
        new_content = GeneratedContent(
            document_id=primary_doc_id,
            content_type=f"generated_{content_type}",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed to generate content: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}"
        )
