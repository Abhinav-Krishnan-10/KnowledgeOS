from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON, ForeignKey, Integer
from pgvector.sqlalchemy import Vector

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    
    # Relationship to documents
    documents: List["Document"] = Relationship(back_populates="category")

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    file_path: str
    size_bytes: int
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    status: str = Field(default="uploaded")  # uploaded, processing, indexed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    category: Optional[Category] = Relationship(back_populates="documents")
    chunks: List["DocumentChunk"] = Relationship(back_populates="document", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    generated_contents: List["GeneratedContent"] = Relationship(back_populates="document", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class DocumentChunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(sa_column=Column(Integer, ForeignKey("document.id", ondelete="CASCADE")))
    text: str
    chunk_index: int
    meta_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Relationships
    document: Document = Relationship(back_populates="chunks")
    embeddings: List["ChunkEmbedding"] = Relationship(back_populates="chunk", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class ChunkEmbedding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    chunk_id: int = Field(sa_column=Column(Integer, ForeignKey("documentchunk.id", ondelete="CASCADE")))
    # Store embedding. Dimension is 384 for BAAI/bge-small-en-v1.5
    embedding: Any = Field(sa_column=Column(Vector(384)))
    
    # Relationships
    chunk: DocumentChunk = Relationship(back_populates="embeddings")

class GeneratedContent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: Optional[int] = Field(default=None, sa_column=Column(Integer, ForeignKey("document.id", ondelete="CASCADE")))
    content_type: str = Field(index=True)  # summary, flashcard, quiz, explanation, notes, resume, report
    data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    document: Optional[Document] = Relationship(back_populates="generated_contents")

class SearchHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    query: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    results_count: int = Field(default=0)
