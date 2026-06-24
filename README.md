# KnowledgeOS

KnowledgeOS is an intelligent Personal Knowledge Management platform designed to transform personal documents, notes, certificates, presentations, and study materials into an interactive, semantic knowledge repository. 

By leveraging local vector embedding generation, OCR capabilities, pgvector indexing, and dynamic LLM providers (Gemini, OpenAI, or Ollama), KnowledgeOS helps users explore, search, query, summarize, and generate new content based on their stored files.

---

## Technical Architecture & Pipeline

KnowledgeOS runs on a modular, containerized architecture orchestrating a **FastAPI backend** and a **PostgreSQL database with the pgvector extension**.

```
 User Request (e.g. Chat / Search / Learning task)
         │
         ▼
    [FastAPI API] (Port 8000)
         │
         ├───► [doc_processor.py] ◄──► [PaddleOCR] (Scanned PDFs / Images OCR)
         │           │
         │           ▼
         │       [embedder.py] (Local BAAI/bge-small-en-v1.5)
         │           │
         │           ▼
         ├───► [vector_store.py] ◄──► [PostgreSQL + pgvector] (Similarity Search)
         │
         ▼
   [rag_engine.py] ◄──► [llm_factory.py] (Gemini / OpenAI / Ollama)
         │
         ▼
    AI Generation (Response text / Caching JSON data / Citations)
```

### Core Pipelines
1.  **Document Acquisition & Indexing Pipeline**:
    *   File is uploaded to the backend and saved locally in `storage/documents/`.
    *   A background task is spawned to load and extract text based on the file type (PDF, DOCX, PPTX, TXT, or images).
    *   **Scanned page/image fallback**: If page text is sparse (< 50 chars), the system renders the page to a temporary image and runs **PaddleOCR** to extract text.
    *   Extracted text is cleaned and recursively split into overlapping chunks (1000 characters with 200 character overlaps).
    *   Chunks are converted into 384-dimensional dense vector embeddings locally using the HuggingFace model `BAAI/bge-small-en-v1.5` via the `sentence-transformers` library.
    *   Chunks and vectors are persisted to the database. The document status is updated to `indexed`.
2.  **Semantic Retrieval & RAG Pipeline**:
    *   User submits query.
    *   Query is vectorized locally using the embedding service.
    *   A cosine similarity vector query is executed on PostgreSQL to retrieve the top $K$ relevant chunks (optionally filtered by document ID or category).
    *   Retrieval metrics ($1.0 - \text{cosine\_distance}$) are converted to similarity scores.
    *   The retrieved source chunks are assembled into a context window.
    *   The system formats a strict context-bounded system prompt.
    *   The prompt is dispatched to the active LLM provider (Gemini 2.5 Flash, OpenAI GPT-4o, or local Ollama model).
    *   The final response is returned along with clickable chunk metadata, document source names, and match accuracy scores.

---

## Implemented Features

*   **Intelligent Document Management**: Background document loading, text cleaning, chunking, and database logging.
*   **Categories & Organization**: Define custom classification directories (e.g. Resumes, Notes, Certificates) to isolate queries.
*   **Workspace Analytics**: Computes total storage size, category distribution counts, generation breakdown logs, and lists recent uploads.
*   **Raw Semantic Search**: Exposes direct vector distance matches over pgvector for keyword-independent semantic matching.
*   **AI Knowledge Assistant (RAG Chat)**: Ask questions grounded exclusively in your files. Includes exact document references and similarity scores.
*   **AI Learning Assistant**: Generates cached study aids:
    *   *concise summaries* (highlights, concepts, conclusions).
    *   *study flashcards* (parseable JSON Question/Answer array).
    *   *assessment quizzes* (JSON formatted multiple-choice lists).
    *   *simplified explanations* (analogies-driven explanations for simple/intermediate/advanced levels).
    *   *revision notes* (markdown formatted study guides).
*   **AI Content Generator**: Grounded content creation allowing you to draft portfolios, cover letters, resumes, or abstracts using specific documents as source material.

---

## Tech Stack

*   **API Framework**: FastAPI, Uvicorn, Python-Multipart
*   **Database & ORM**: PostgreSQL, pgvector extension, SQLModel (unifying SQLAlchemy + Pydantic)
*   **AI Processing**: SentenceTransformers (local PyTorch models), Google GenAI SDK, OpenAI SDK, HTTPX (for Ollama API connectivity)
*   **File Extractors**: PyMuPDF (`fitz`), Python-Docx, Python-Pptx, PaddleOCR
*   **Containerization**: Docker, Docker Compose

---

## Repository Directory Structure

```
KnowledgeOS/
├── backend/
│   ├── app/
│   │   ├── api/                   # FastAPI endpoint routers
│   │   │   ├── documents.py       # File uploads, categories, analytics
│   │   │   ├── search.py          # pgvector raw similarity lookup
│   │   │   ├── chat.py            # AI Assistant RAG chat
│   │   │   ├── learning.py        # Summaries, flashcards, quizzes generator
│   │   │   └── generation.py      # Cover letters, resume content compiler
│   │   ├── core/                  # Core configurations
│   │   │   ├── config.py          # Settings validation (Pydantic-Settings)
│   │   │   └── llm_factory.py     # Dynamically fetches the configured LLM class
│   │   ├── db/                    # SQLModel database configuration
│   │   │   ├── database.py        # Engine creation & session lifecycle
│   │   │   └── models.py          # Category, Document, Chunk, and Embedding tables
│   │   ├── services/              # AI and processing service logic
│   │   │   ├── providers/         # Concrete LLM interface wrappers
│   │   │   │   ├── base.py        # Abstract LLMProvider interface
│   │   │   │   ├── gemini.py      # Google Gemini 2.5 Flash implementation
│   │   │   │   ├── openai.py      # OpenAI GPT-4o implementation
│   │   │   │   └── ollama.py      # Local offline Ollama implementation
│   │   │   ├── doc_processor.py   # PyMuPDF, Docx, Pptx parsers & PaddleOCR
│   │   │   ├── embedder.py        # Local SentenceTransformer embeddings generator
│   │   │   └── vector_store.py    # Cosine distance similarity query service
│   │   ├── tests/
│   │   │   └── smoke_test.py      # CLI compilation & system configuration check
│   │   └── main.py                # Core FastAPI app entry point
│   ├── storage/
│   │   └── documents/             # Uploaded source documents storage
│   ├── .env                       # Local active environment config (git-ignored)
│   ├── Dockerfile                 # Slim-Python setup compiling PaddleOCR dependencies
│   └── requirements.txt           # Lockfile for backend libraries
├── docker-compose.yml             # Orchestration of backend and pgvector database
├── sample.env                     # Reference configuration variables file
├── rebuild_instructions.md        # Reference codebase containing full code implementations
└── README.md                      # Project manual
```

---

## Configuration Variables & Environment Setup

Configurations are loaded dynamically from a `.env` file placed in the `backend/` folder. A reference config file is provided at the root: [sample.env](file:///d:/Projects/Add_On/KnowledgeOS/sample.env).

### Setting up the Environment
1. Copy [sample.env](file:///d:/Projects/Add_On/KnowledgeOS/sample.env) to the `backend/` directory as `.env`:
   ```bash
   cp sample.env backend/.env
   ```
2. Open `backend/.env` and update the keys:
   *   To run **Gemini**: Set `LLM_PROVIDER=gemini` and insert your `GEMINI_API_KEY`.
   *   To run **OpenAI**: Set `LLM_PROVIDER=openai` and insert your `OPENAI_API_KEY`.
   *   To run **Ollama** locally: Set `LLM_PROVIDER=ollama`. Ensure Ollama is running on your host machine. The default endpoint `http://host.docker.internal:11434` resolves seamlessly inside the Docker container.
   *   To edit the embedding model name: Set `EMBEDDING_MODEL` (defaults to BAAI/bge-small-en-v1.5).

---

## Startup and Run Directions

### 1. Build and Launch Containers
To build the FastAPI backend image and start the backend and database containers:
```bash
docker compose up -d --build
```
This builds the backend image (compiling dependencies like C++ libraries required for PyMuPDF and OCR) and boots up:
*   **FastAPI backend container** (`knowledgeos_backend`) on port `http://localhost:8000`
*   **PostgreSQL pgvector container** (`knowledgeos_db`) on port `5432`

### 2. Verify Startup (Smoke Test)
To verify that all classes import correctly, environments load successfully, and database connectors bind, execute the smoke test script inside the running container:
```bash
docker exec -it knowledgeos_backend python app/tests/smoke_test.py
```

### 3. Check Web API Status
You can run a query to check database connectivity and model status:
```bash
curl -X GET http://localhost:8000/api/status
```

---

## Authors & Contributors

*   **Binil K Joseph**
*   **Leah Ann Jacob**
*   **Simna Shajahan**
*   **Abhinav Krishnan**
