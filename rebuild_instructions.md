# KnowledgeOS: Services Reconstruction Instructions & Codebase Backup

This document contains the complete production-ready source code and instructions for the **KnowledgeOS** RAG Services Layer. Any AI Agent or developer can read this file to restore the full functionalities of the backend services from a clean stub state.

---

## AI Rebuild Agent Prompt
> [!TIP]
> **Instructions for the AI Assistant / Coding Agent:**
> 
> You are tasked with restoring the production-ready logic of the KnowledgeOS Services Layer. Overwrite the existing mock stubs by reading the code blocks in this document and writing them to their respective file paths:
> 
> 1. Overwrite [embedder.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/embedder.py) with the code in the **1. Local Embedding Service** section.
> 2. Overwrite [doc_processor.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/doc_processor.py) with the code in the **2. Document Extraction & Splitter** section.
> 3. Overwrite [vector_store.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/vector_store.py) with the code in the **3. pgvector Database Integration** section.
> 4. Overwrite [rag_engine.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/rag_engine.py) with the code in the **4. RAG Engine Workflow** section.
> 5. Overwrite the base and provider classes inside `backend/app/services/providers/` ([base.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/providers/base.py), [gemini.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/providers/gemini.py), [openai.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/providers/openai.py), [ollama.py](file:///d:/Projects/Add_On/KnowledgeOS/backend/app/services/providers/ollama.py)) with the code in the **5. Providers Base & Implementations** section.
> 6. Run `docker exec knowledgeos_backend python app/tests/smoke_test.py` to verify imports and configurations load cleanly in the container.
> 
> Go ahead and execute the writes for each target file. Do not omit any helper functions or imports.

---

## 1. Local Embedding Service

### File: `backend/app/services/embedder.py`
Instantiates a local `SentenceTransformer` model (`BAAI/bge-small-en-v1.5`) inside the container to generate 384-dimensional dense vector embeddings.

```python
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
```

---

## 2. Document Extraction & Splitter

### File: `backend/app/services/doc_processor.py`
Parses PDF, DOCX, PPTX, TXT, and images. Image inputs and scanned PDF pages are automatically transcribed using **PaddleOCR**. Includes a zero-dependency text chunker.

```python
import os
import re
import logging
from typing import List, Dict, Any
import fitz  # PyMuPDF
import docx
import pptx

class RecursiveCharacterTextSplitter:
    """A lightweight, zero-dependency recursive character text splitter."""
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200, separators: List[str] = None):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", " ", ""]

    def split_text(self, text: str) -> List[str]:
        if not text:
            return []
        
        chunks = []
        
        def recurse(text_to_split: str, separators_list: List[str]):
            if len(text_to_split) <= self.chunk_size:
                chunks.append(text_to_split)
                return
                
            if not separators_list:
                # Force split when no separators left
                step = max(1, self.chunk_size - self.chunk_overlap)
                for i in range(0, len(text_to_split), step):
                    chunks.append(text_to_split[i:i + self.chunk_size])
                return

            sep = separators_list[0]
            parts = text_to_split.split(sep)
            
            current_part = ""
            for part in parts:
                if len(part) > self.chunk_size:
                    if current_part:
                        chunks.append(current_part)
                        current_part = ""
                    recurse(part, separators_list[1:])
                elif len(current_part) + len(part) + (len(sep) if current_part else 0) <= self.chunk_size:
                    current_part += (sep if current_part else "") + part
                else:
                    if current_part:
                        chunks.append(current_part)
                    current_part = part
            if current_part:
                chunks.append(current_part)

        recurse(text, self.separators)
        return [c for c in chunks if c.strip()]

logger = logging.getLogger(__name__)

# Lazy initialization of PaddleOCR
_ocr_instance = None

def get_ocr_instance():
    global _ocr_instance
    if _ocr_instance is None:
        try:
            from paddleocr import PaddleOCR
            _ocr_instance = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            logger.info("PaddleOCR successfully initialized.")
        except Exception as e:
            logger.warning(f"PaddleOCR failed to initialize. OCR will be unavailable. Error: {e}")
    return _ocr_instance

class DocumentProcessor:
    """Service for parsing documents, clean text, and chunk content."""
    
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )

    def clean_text(self, text: str) -> str:
        """Removes duplicate whitespaces, control characters, and normalizes spacing."""
        if not text:
            return ""
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def run_ocr_on_page(self, page) -> str:
        """Saves a temporary page image and extracts text using PaddleOCR."""
        ocr = get_ocr_instance()
        if not ocr:
            logger.warning("PaddleOCR instance not available; skipping OCR for page.")
            return ""
            
        temp_img = f"temp_page_{page.number}.png"
        try:
            pix = page.get_pixmap(dpi=150)
            pix.save(temp_img)
            
            result = ocr.ocr(temp_img, cls=True)
            txts = []
            if result and result[0]:
                for line in result[0]:
                    txts.append(line[1][0])
            return " ".join(txts)
        except Exception as e:
            logger.error(f"Error running OCR on PDF page: {e}")
            return ""
        finally:
            if os.path.exists(temp_img):
                try:
                    os.remove(temp_img)
                except Exception:
                    pass

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extracts text from PDF. Scanned pages are processed via OCR."""
        text_content = []
        try:
            doc = fitz.open(file_path)
            for page in doc:
                page_text = page.get_text()
                if len(page_text.strip()) < 50:
                    ocr_text = self.run_ocr_on_page(page)
                    if ocr_text:
                        page_text = ocr_text
                text_content.append(page_text)
            doc.close()
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raise e
        return "\n\n".join(text_content)

    def extract_text_from_docx(self, file_path: str) -> str:
        try:
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                full_text.append(para.text)
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"Failed to extract text from DOCX: {e}")
            raise e

    def extract_text_from_pptx(self, file_path: str) -> str:
        try:
            prs = pptx.Presentation(file_path)
            text_runs = []
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text:
                        text_runs.append(shape.text)
            return "\n".join(text_runs)
        except Exception as e:
            logger.error(f"Failed to extract text from PPTX: {e}")
            raise e

    def extract_text_from_image(self, file_path: str) -> str:
        ocr = get_ocr_instance()
        if not ocr:
            raise RuntimeError("PaddleOCR is not available for image text extraction.")
        try:
            result = ocr.ocr(file_path, cls=True)
            txts = []
            if result and result[0]:
                for line in result[0]:
                    txts.append(line[1][0])
            return "\n".join(txts)
        except Exception as e:
            logger.error(f"Failed to extract text from image: {e}")
            raise e

    def extract_text_from_txt(self, file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to read TXT file: {e}")
            raise e

    def process_document(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            raw_text = self.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            raw_text = self.extract_text_from_docx(file_path)
        elif ext == ".pptx":
            raw_text = self.extract_text_from_pptx(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff"]:
            raw_text = self.extract_text_from_image(file_path)
        elif ext == ".txt":
            raw_text = self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        return self.clean_text(raw_text)

    def chunk_text(self, text: str) -> List[str]:
        return self.text_splitter.split_text(text)
```

---

## 3. pgvector Database Integration

### File: `backend/app/services/vector_store.py`
Calculates vector dimensions, saves embeddings to SQLModel tables, and runs cosine distance queries over the `pgvector` database extension.

```python
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
```

---

## 4. RAG Engine Workflow

### File: `backend/app/services/rag_engine.py`
Retrieves vector matches, compiles prompts with source contexts, queries dynamic LLM models, and returns replies and reference metadata lists.

```python
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
```

---

## 5. Providers Base & Implementations

### Base Provider: `backend/app/services/providers/base.py`
```python
from typing import Optional

class LLMProvider:
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        raise NotImplementedError
    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        raise NotImplementedError
```

### Gemini Provider: `backend/app/services/providers/gemini.py`
```python
import logging
from typing import Optional
from google import genai
from google.genai import types
from app.services.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-2.5-flash"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        try:
            config = types.GenerateContentConfig(system_instruction=system_instruction) if system_instruction else None
            response = self.client.models.generate_content(model=self.model, contents=prompt, config=config)
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generate failed: {e}")
            raise e

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        try:
            config = types.GenerateContentConfig(system_instruction=system_instruction) if system_instruction else None
            response = await self.client.aio.models.generate_content(model=self.model, contents=prompt, config=config)
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generate_async failed: {e}")
            raise e
```

### OpenAI Provider: `backend/app/services/providers/openai.py`
```python
import logging
from typing import Optional
from openai import OpenAI, AsyncOpenAI
from app.services.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIProvider(LLMProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured.")
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.async_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        try:
            messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
            messages.append({"role": "user", "content": prompt})
            response = self.client.chat.completions.create(model=self.model, messages=messages)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generate failed: {e}")
            raise e

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        try:
            messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
            messages.append({"role": "user", "content": prompt})
            response = await self.async_client.chat.completions.create(model=self.model, messages=messages)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generate_async failed: {e}")
            raise e
```

### Ollama Provider: `backend/app/services/providers/ollama.py`
```python
import logging
import httpx
from typing import Optional
from app.services.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaProvider(LLMProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
        messages.append({"role": "user", "content": prompt})
        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(f"{self.base_url}/api/chat", json={"model": self.model, "messages": messages, "stream": False})
                response.raise_for_status()
                return response.json().get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Ollama generate failed: {e}")
            raise e

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
        messages.append({"role": "user", "content": prompt})
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(f"{self.base_url}/api/chat", json={"model": self.model, "messages": messages, "stream": False})
                response.raise_for_status()
                return response.json().get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Ollama generate_async failed: {e}")
            raise e
```
