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
        category_id: Optional[int] = None,
        enable_web_search: bool = True,
        score_threshold: float = 0.55
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
            retrieved_context = []
            
            for chunk, score in chunks_with_scores:
                if score < score_threshold:
                    continue
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
                retrieved_context.append({
                    "text": chunk.text,
                    "document_name": doc_name,
                    "chunk_index": chunk.chunk_index,
                    "similarity_score": score
                })

            context_str = "\n\n".join(context_blocks)
            
            system_instruction = (
                "You are the AI Knowledge Assistant of KnowledgeOS, a premium personal AI workspace.\n"
                "Your goal is to answer the user's question accurately, clearly, and comprehensively.\n\n"
                "Grounding Guidelines:\n"
                "- If the user asks a question relevant to the provided context chunks from their knowledge base, "
                "prioritize answering based on those chunks and cite the sources/filenames where appropriate.\n"
                "- If the context chunks are empty, irrelevant, or do not contain information related to the question, "
                "ignore them completely. Answer the query comprehensively using your general knowledge and live web search grounding.\n"
                "- Clearly differentiate between facts grounded in the user's documents and general knowledge/web results."
            )
            
            prompt = (
                f"User Question:\n{query_text}\n\n"
                f"Context Chunks from User's Knowledge Base:\n"
                f"{context_str if context_str else '[No context found in knowledge base]'}\n\n"
                f"Please construct the final response. Prioritize using the context chunks above if they are relevant, "
                f"or answer using general knowledge/web search if they are not."
            )
            
            answer = self.llm_provider.generate(
                prompt=prompt,
                system_instruction=system_instruction,
                enable_web_search=enable_web_search
            )
            
            return {
                "answer": answer,
                "references": references,
                "retrieved_context": retrieved_context
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
        category_id: Optional[int] = None,
        enable_web_search: bool = True,
        score_threshold: float = 0.55
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
            retrieved_context = []
            
            for chunk, score in chunks_with_scores:
                if score < score_threshold:
                    continue
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
                retrieved_context.append({
                    "text": chunk.text,
                    "document_name": doc_name,
                    "chunk_index": chunk.chunk_index,
                    "similarity_score": score
                })

            context_str = "\n\n".join(context_blocks)
            
            system_instruction = (
                "You are the AI Knowledge Assistant of KnowledgeOS, a premium personal AI workspace.\n"
                "Your goal is to answer the user's question accurately, clearly, and comprehensively.\n\n"
                "Grounding Guidelines:\n"
                "- If the user asks a question relevant to the provided context chunks from their knowledge base, "
                "prioritize answering based on those chunks and cite the sources/filenames where appropriate.\n"
                "- If the context chunks are empty, irrelevant, or do not contain information related to the question, "
                "ignore them completely. Answer the query comprehensively using your general knowledge and live web search grounding.\n"
                "- Clearly differentiate between facts grounded in the user's documents and general knowledge/web results."
            )
            
            prompt = (
                f"User Question:\n{query_text}\n\n"
                f"Context Chunks from User's Knowledge Base:\n"
                f"{context_str if context_str else '[No context found in knowledge base]'}\n\n"
                f"Please construct the final response. Prioritize using the context chunks above if they are relevant, "
                f"or answer using general knowledge/web search if they are not."
            )
            
            answer = await self.llm_provider.generate_async(
                prompt=prompt,
                system_instruction=system_instruction,
                enable_web_search=enable_web_search
            )
            
            return {
                "answer": answer,
                "references": references,
                "retrieved_context": retrieved_context
            }
        except Exception as e:
            logger.error(f"Error in async RAG query: {e}")
            raise e
