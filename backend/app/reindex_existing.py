import logging
from sqlmodel import Session, select, delete
from app.db.database import engine
from app.db.models import Document, DocumentChunk
from app.services.doc_processor import DocumentProcessor
from app.services.vector_store import VectorStoreService
from app.services.embedder import EmbeddingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    doc_processor = DocumentProcessor()
    embedder = EmbeddingService()
    vector_store = VectorStoreService(embedder)
    
    with Session(engine) as session:
        # Retrieve all documents
        documents = session.exec(select(Document)).all()
        if not documents:
            print("No documents found in the database.")
            return
            
        print(f"Found {len(documents)} documents to re-index.")
        
        for doc in documents:
            print(f"\n--- Re-indexing document: {doc.name} (ID: {doc.id}) ---")
            try:
                # Delete existing chunks (cascade deletes embeddings automatically)
                session.exec(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))
                session.commit()
                print(f"Cleared existing chunks and embeddings for document ID {doc.id}")
                
                # Mark document as processing
                doc.status = "processing"
                session.add(doc)
                session.commit()
                
                # Extract text using document processor
                cleaned_text = doc_processor.process_document(doc.file_path)
                print(f"Extracted {len(cleaned_text)} characters of cleaned text.")
                
                # Split text into the new smaller chunks
                chunks = doc_processor.chunk_text(cleaned_text)
                print(f"Split document into {len(chunks)} chunks.")
                
                # Save new chunks and embeddings to database
                vector_store.save_document_embeddings(session, doc.id, chunks)
                
                # Mark document as successfully indexed
                doc.status = "indexed"
                session.add(doc)
                session.commit()
                print(f"Successfully re-indexed: {doc.name}")
                
            except Exception as e:
                session.rollback()
                doc.status = "failed"
                session.add(doc)
                session.commit()
                print(f"ERROR re-indexing document {doc.name}: {e}")
                
        print("\nRe-indexing task completed for all documents.")

if __name__ == "__main__":
    main()
