import logging
from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from app.core.config import settings
from app.db.database import init_db, get_session
from app.db.models import Document, Category
from app.api import documents, search, chat, learning, generation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="KnowledgeOS API",
    description="Backend services and RAG pipelines for the AI Personal Knowledge Workspace",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization
@app.on_event("startup")
def on_startup():
    logger.info("Initializing Database...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Critical error on startup initializing database: {e}")

# Base router for versioning
api_router = APIRouter(prefix="/api")

# System Status Endpoint
@api_router.get("/status")
async def get_status(session: Session = Depends(get_session)):
    # Check DB connectivity
    db_connected = False
    doc_count = 0
    cat_count = 0
    try:
        doc_count = session.exec(select(func.count(Document.id))).one()
        cat_count = session.exec(select(func.count(Category.id))).one()
        db_connected = True
    except Exception as e:
        logger.error(f"Database status check failed: {e}")
        
    # Check LLM key status based on active provider
    active_provider = settings.LLM_PROVIDER.lower().strip()
    provider_configured = False
    if active_provider == "gemini":
        provider_configured = bool(settings.GEMINI_API_KEY)
    elif active_provider == "openai":
        provider_configured = bool(settings.OPENAI_API_KEY)
    elif active_provider == "ollama":
        provider_configured = True  # local, requires no API Key
        
    return {
        "status": "online",
        "environment": settings.ENV,
        "database": {
            "connected": db_connected,
            "total_documents": doc_count,
            "total_categories": cat_count
        },
        "llm_abstraction": {
            "active_provider": active_provider,
            "configured": provider_configured,
            "model_name": settings.OLLAMA_MODEL if active_provider == "ollama" else (
                "gemini-2.5-flash" if active_provider == "gemini" else "gpt-4o"
            )
        },
        "embeddings": {
            "model_name": settings.EMBEDDING_MODEL
        }
    }

# Include all module routers
api_router.include_router(documents.router)
api_router.include_router(search.router)
api_router.include_router(chat.router)
api_router.include_router(learning.router)
api_router.include_router(generation.router)

# Mount base api router
app.include_router(api_router)
