import logging
from typing import Optional, Dict, Any
from sqlmodel import Session
from app.services.vector_store import VectorStoreService
from app.services.providers.base import LLMProvider

logger = logging.getLogger(__name__)

class RAGEngine:
    def __init__(self, vector_store: VectorStoreService, llm_provider: LLMProvider):
        self.vector_store = vector_store
        self.llm_provider = llm_provider

    def query(
        self,
        session: Session,
        query_text: str,
        limit: int = 5,
        document_id: Optional[int] = None,
        category_id: Optional[int] = None
    ) -> Dict[str, Any]:
        try:
            chunks_with_scores = self.vector_store.search_similar_chunks(
                session=session,
                query=query_text,
                limit=limit,
                document_id=document_id,
                category_id=category_id
            )
            
            context_blocks = []
            references = []
            
            for chunk, score in chunks_with_scores:
                doc_name = chunk.document.name if chunk.document else f"Doc ID {chunk.document_id}"
                context_blocks.append(
                    f"--- START SOURCE CHUNK ({doc_name}, Index {chunk.chunk_index}) ---\n"
                    f"{chunk.text}\n"
                    f"--- END SOURCE CHUNK ---"
                )
                references.append({
                    "document_id": chunk.document_id,
                    "document_name": doc_name,
                    "chunk_index": chunk.chunk_index,
                    "similarity_score": score
                })

            context_str = "\n\n".join(context_blocks)
            
            system_instruction = (
                "You are the AI Knowledge Assistant of KnowledgeOS.\n"
                "Your goal is to answer the user's question accurately, concisely, and based ONLY on the source chunks provided. "
                "Citing documents/sources you extract information from is crucial for validation.\n\n"
                "Constraints:\n"
                "- If the context chunks do not contain information relevant to the user's query, "
                "honestly state that you cannot answer based on the stored knowledge base rather than fabricating facts.\n"
                "- Only use facts that are directly mentioned in the sources. Do not assume or extrapolate."
            )
            
            prompt = (
                f"User Question:\n{query_text}\n\n"
                f"Context Chunks from User's Knowledge Base:\n"
                f"{context_str if context_str else '[No context found in knowledge base]'}\n\n"
                f"Please construct the final response using the context chunks above."
            )
            
            answer = self.llm_provider.generate(
                prompt=prompt,
                system_instruction=system_instruction
            )
            
            return {
                "answer": answer,
                "references": references
            }
        except Exception as e:
            logger.error(f"Error in RAG query: {e}")
            raise e

    async def query_async(
        self,
        session: Session,
        query_text: str,
        limit: int = 5,
        document_id: Optional[int] = None,
        category_id: Optional[int] = None
    ) -> Dict[str, Any]:
        try:
            chunks_with_scores = self.vector_store.search_similar_chunks(
                session=session,
                query=query_text,
                limit=limit,
                document_id=document_id,
                category_id=category_id
            )
            
            context_blocks = []
            references = []
            
            for chunk, score in chunks_with_scores:
                doc_name = chunk.document.name if chunk.document else f"Doc ID {chunk.document_id}"
                context_blocks.append(
                    f"--- START SOURCE CHUNK ({doc_name}, Index {chunk.chunk_index}) ---\n"
                    f"{chunk.text}\n"
                    f"--- END SOURCE CHUNK ---"
                )
                references.append({
                    "document_id": chunk.document_id,
                    "document_name": doc_name,
                    "chunk_index": chunk.chunk_index,
                    "similarity_score": score
                })

            context_str = "\n\n".join(context_blocks)
            
            system_instruction = (
                "You are the AI Knowledge Assistant of KnowledgeOS.\n"
                "Your goal is to answer the user's question accurately, concisely, and based ONLY on the source chunks provided. "
                "Citing documents/sources you extract information from is crucial for validation.\n\n"
                "Constraints:\n"
                "- If the context chunks do not contain information relevant to the user's query, "
                "honestly state that you cannot answer based on the stored knowledge base rather than fabricating facts.\n"
                "- Only use facts that are directly mentioned in the sources. Do not assume or extrapolate."
            )
            
            prompt = (
                f"User Question:\n{query_text}\n\n"
                f"Context Chunks from User's Knowledge Base:\n"
                f"{context_str if context_str else '[No context found in knowledge base]'}\n\n"
                f"Please construct the final response using the context chunks above."
            )
            
            answer = await self.llm_provider.generate_async(
                prompt=prompt,
                system_instruction=system_instruction
            )
            
            return {
                "answer": answer,
                "references": references
            }
        except Exception as e:
            logger.error(f"Error in async RAG query: {e}")
            raise e
