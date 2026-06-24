from sqlmodel import SQLModel, create_engine, Session, text
from app.core.config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True if settings.ENV == "development" else False
)

def init_db():
    """Initializes the database, creating tables and extensions."""
    # We must ensure pgvector extension is enabled in PostgreSQL
    with Session(engine) as session:
        try:
            session.exec(text("CREATE EXTENSION IF NOT EXISTS vector"))
            session.commit()
        except Exception as e:
            # If user does not have superuser privileges, pgvector might fail to create.
            # Log and handle gracefully or print.
            print(f"Warning: Failed to create pgvector extension: {e}")
            session.rollback()
            
    # Import all models to ensure they are registered with SQLModel.metadata
    from app.db import models
    
    # Create all tables
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for obtaining a database session."""
    with Session(engine) as session:
        yield session
