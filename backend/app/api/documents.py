import os
import shutil
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlmodel import Session, select, func
from app.db.database import get_session
from app.db.models import Document, Category, DocumentChunk, GeneratedContent
from app.core.config import settings
from app.services.doc_processor import DocumentProcessor
from app.services.vector_store import VectorStoreService
from app.services.embedder import EmbeddingService

router = APIRouter(prefix="/documents", tags=["documents"])

doc_processor = DocumentProcessor()
embedder = EmbeddingService()
vector_store = VectorStoreService(embedder)

# Helper function to background process uploads
def process_upload_task(file_path: str, doc_id: int, db_session_factory):
    # We open a new session in the background thread
    with db_session_factory() as session:
        doc = session.get(Document, doc_id)
        if not doc:
            return
        try:
            doc.status = "processing"
            session.add(doc)
            session.commit()
            
            # Extract text
            cleaned_text = doc_processor.process_document(file_path)
            
            # Split to chunks
            chunks = doc_processor.chunk_text(cleaned_text)
            
            # Save chunks & embeddings (which commits)
            vector_store.save_document_embeddings(session, doc_id, chunks)
            
            doc.status = "indexed"
            session.add(doc)
            session.commit()
        except Exception as e:
            session.rollback()
            doc.status = "failed"
            session.add(doc)
            session.commit()
            # Clean up raw file if failed (optional, let's keep it for debug or remove it)

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    category_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".pdf", ".docx", ".pptx", ".txt", ".png", ".jpg", ".jpeg", ".bmp", ".tiff"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported: {', '.join(allowed_exts)}"
        )
        
    # Check if category exists
    if category_id is not None:
        cat = session.get(Category, category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found.")

    # Save to local storage
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file locally: {e}")
        
    size_bytes = os.path.getsize(file_path)
    
    # Save document meta record in database
    db_doc = Document(
        name=file.filename,
        file_path=file_path,
        size_bytes=size_bytes,
        category_id=category_id,
        status="uploaded"
    )
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)
    
    # Trigger background indexing
    from app.db.database import get_session as get_session_callable
    background_tasks.add_task(
        process_upload_task,
        file_path,
        db_doc.id,
        get_session_callable
    )
    
    return {
        "document_id": db_doc.id,
        "filename": db_doc.name,
        "status": db_doc.status,
        "message": "File uploaded successfully. Processing pipeline started in background."
    }

@router.get("", response_model=List[Document])
async def list_documents(
    category_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    query = select(Document)
    if category_id is not None:
        query = query.where(Document.category_id == category_id)
    return session.exec(query).all()

@router.delete("/{document_id}")
async def delete_document(document_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    # Remove file from local storage
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            # log warning but continue DB deletion
            pass
            
    session.delete(doc)
    session.commit()
    return {"status": "success", "message": f"Document '{doc.name}' deleted successfully."}

# Categories Endpoints
@router.get("/categories", response_model=List[Category])
async def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.post("/categories", response_model=Category)
async def create_category(category: Category, session: Session = Depends(get_session)):
    # Check if duplicate name
    existing = session.exec(select(Category).where(Category.name == category.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists.")
        
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

# Analytics Overview
@router.get("/analytics")
async def get_analytics(session: Session = Depends(get_session)):
    total_docs = session.exec(select(func.count(Document.id))).one()
    
    # Calculate storage size in megabytes
    total_bytes = session.exec(select(func.sum(Document.size_bytes))).one() or 0
    total_mb = round(total_bytes / (1024 * 1024), 2)
    
    # Files per category
    categories = session.exec(select(Category)).all()
    files_by_category = {}
    for cat in categories:
        count = session.exec(select(func.count(Document.id)).where(Document.category_id == cat.id)).one()
        files_by_category[cat.name] = count
        
    # Uncategorized count
    uncategorized_count = session.exec(select(func.count(Document.id)).where(Document.category_id == None)).one()
    if uncategorized_count > 0:
        files_by_category["Uncategorized"] = uncategorized_count
        
    # Recently uploaded (past 5 documents)
    recent = session.exec(
        select(Document).order_by(Document.created_at.desc()).limit(5)
    ).all()
    
    # AI Generation count by type
    generations = session.exec(
        select(GeneratedContent.content_type, func.count(GeneratedContent.id))
        .group_by(GeneratedContent.content_type)
    ).all()
    generations_breakdown = {g[0]: g[1] for g in generations}

    return {
        "total_documents": total_docs,
        "storage_usage_mb": total_mb,
        "categories_breakdown": files_by_category,
        "generations_breakdown": generations_breakdown,
        "recently_uploaded": [
            {
                "id": doc.id,
                "name": doc.name,
                "status": doc.status,
                "created_at": doc.created_at
            } for doc in recent
        ]
    }
