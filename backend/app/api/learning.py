import json
import re
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import Document, GeneratedContent, DocumentChunk
from app.core.llm_factory import get_llm_provider

router = APIRouter(prefix="/learning", tags=["learning"])

logger = logging.getLogger(__name__)

def extract_json_from_text(text: str) -> Any:
    """Helper to extract and parse JSON lists/objects from raw LLM responses."""
    cleaned = text.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
        
    # Extract markdown code block
    match_block = re.search(r'```(?:json)?\s*(.*?)\s*```', cleaned, re.DOTALL | re.IGNORECASE)
    if match_block:
        try:
            return json.loads(match_block.group(1).strip())
        except json.JSONDecodeError:
            pass
            
    # Fallback to scanning for array bounds
    match_arr = re.search(r'(\[.*\])', cleaned, re.DOTALL)
    if match_arr:
        try:
            return json.loads(match_arr.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Fallback to scanning for object bounds
    match_obj = re.search(r'(\{.*\})', cleaned, re.DOTALL)
    if match_obj:
        try:
            return json.loads(match_obj.group(1).strip())
        except json.JSONDecodeError:
            pass

    raise ValueError("LLM did not return a parseable JSON block.")

def get_document_full_text(session: Session, document_id: int) -> str:
    """Combines all chunks of a document ordered by index."""
    chunks = session.exec(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
    ).all()
    
    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Document has no parsed content. Please ensure it indexed correctly."
        )
    return "\n\n".join([c.text for c in chunks])

@router.post("/summary")
async def generate_summary(
    document_id: int = Body(..., embed=True),
    force_regenerate: bool = Body(False),
    session: Session = Depends(get_session)
):
    """Generates a concise summary of the document, caching the output."""
    # Check if document exists
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    # Check cache first
    if not force_regenerate:
        cached = session.exec(
            select(GeneratedContent)
            .where(GeneratedContent.document_id == document_id)
            .where(GeneratedContent.content_type == "summary")
        ).first()
        if cached:
            return cached.data

    full_text = get_document_full_text(session, document_id)
    # Cap text length to prevent model token limits
    capped_text = full_text[:40000] 
    
    try:
        llm = get_llm_provider()
        system_instruction = "You are an educational AI assistant that extracts key takeaways and creates clear summaries of text."
        prompt = (
            f"Analyze the following document and write a structured, clear, and comprehensive summary. "
            f"Use sections like 'Key Highlights', 'Core Concepts', and a final 'Concluding Summary'. "
            f"Ensure formatting is clean markdown:\n\n{capped_text}"
        )
        
        summary_text = await llm.generate_async(prompt, system_instruction)
        
        result_data = {"summary": summary_text}
        
        # Save to database
        new_content = GeneratedContent(
            document_id=document_id,
            content_type="summary",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed generating summary: {e}")
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")

@router.post("/flashcards")
async def generate_flashcards(
    document_id: int = Body(..., embed=True),
    count: int = Body(10),
    force_regenerate: bool = Body(False),
    session: Session = Depends(get_session)
):
    """Generates question-answer learning cards based on the document."""
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if not force_regenerate:
        cached = session.exec(
            select(GeneratedContent)
            .where(GeneratedContent.document_id == document_id)
            .where(GeneratedContent.content_type == "flashcard")
        ).first()
        if cached:
            return cached.data

    full_text = get_document_full_text(session, document_id)
    capped_text = full_text[:30000]
    
    try:
        llm = get_llm_provider()
        system_instruction = "You are a professional educational developer. You create flashcards to help students study materials."
        prompt = (
            f"Based on the text below, create {count} flashcards. Each flashcard must consist of a "
            f"'question' and a direct, accurate 'answer'. You MUST return the output ONLY as a JSON list "
            f"in the following format:\n"
            f"[\n"
            f"  {{\"question\": \"What is X?\", \"answer\": \"X is...\"}},\n"
            f"  ...\n"
            f"]\n\n"
            f"Document Text:\n{capped_text}"
        )
        
        raw_response = await llm.generate_async(prompt, system_instruction)
        flashcards_list = extract_json_from_text(raw_response)
        
        result_data = {"flashcards": flashcards_list}
        
        new_content = GeneratedContent(
            document_id=document_id,
            content_type="flashcard",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed generating flashcards: {e}")
        raise HTTPException(status_code=500, detail=f"Flashcards generation failed: {str(e)}")

@router.post("/quiz")
async def generate_quiz(
    document_id: int = Body(..., embed=True),
    count: int = Body(5),
    force_regenerate: bool = Body(False),
    session: Session = Depends(get_session)
):
    """Generates dynamic assessment multiple-choice questions from the document."""
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if not force_regenerate:
        cached = session.exec(
            select(GeneratedContent)
            .where(GeneratedContent.document_id == document_id)
            .where(GeneratedContent.content_type == "quiz")
        ).first()
        if cached:
            return cached.data

    full_text = get_document_full_text(session, document_id)
    capped_text = full_text[:30000]
    
    try:
        llm = get_llm_provider()
        system_instruction = "You are an academic test designer. You build multiple choice assessment quizzes."
        prompt = (
            f"Based on the text below, generate a multiple-choice quiz with {count} questions. "
            f"Each question must include the text of the question, 4 choice options (A, B, C, D), and denote the correct answer. "
            f"You MUST format the output ONLY as a JSON list in the following structure:\n"
            f"[\n"
            f"  {{\n"
            f"    \"question\": \"The question text?\",\n"
            f"    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
            f"    \"correct_answer\": \"Option A\"\n"
            f"  }},\n"
            f"  ...\n"
            f"]\n\n"
            f"Document Text:\n{capped_text}"
        )
        
        raw_response = await llm.generate_async(prompt, system_instruction)
        quiz_list = extract_json_from_text(raw_response)
        
        result_data = {"quiz": quiz_list}
        
        new_content = GeneratedContent(
            document_id=document_id,
            content_type="quiz",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed generating quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@router.post("/explain")
async def generate_explanation(
    document_id: int = Body(..., embed=True),
    concept: Optional[str] = Body(None),
    level: str = Body("simple"),  # simple, intermediate, advanced
    session: Session = Depends(get_session)
):
    """Explains a complex concept within the document using plain English."""
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    full_text = get_document_full_text(session, document_id)
    capped_text = full_text[:30000]
    
    try:
        llm = get_llm_provider()
        system_instruction = "You are a teacher specialized in explaining complex technical parameters in easy-to-understand terms."
        
        target = f"the concept '{concept}' as discussed in the text" if concept else "the general core contents of the text"
        prompt = (
            f"Explain {target} using a level suitable for a '{level}' audience. "
            f"If '{level}' is simple, explain like I'm 5, using clear analogies and zero jargon. "
            f"If intermediate, explain like a high schooler. "
            f"If advanced, provide a collegiate deep dive.\n\n"
            f"Document Text:\n{capped_text}"
        )
        
        explanation_text = await llm.generate_async(prompt, system_instruction)
        result_data = {"concept": concept, "level": level, "explanation": explanation_text}
        
        new_content = GeneratedContent(
            document_id=document_id,
            content_type="explanation",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed generating explanation: {e}")
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")

@router.post("/notes")
async def generate_notes(
    document_id: int = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    """Generates quick-study revision notes from the document."""
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    full_text = get_document_full_text(session, document_id)
    capped_text = full_text[:30000]
    
    try:
        llm = get_llm_provider()
        system_instruction = "You are a professional writer specialized in formatting educational study guides and cheat sheets."
        prompt = (
            f"Based on the document text below, create a structured revision guide and cheat sheet. "
            f"Organize into key headers, bulleted lists of vocabulary or variables, and callout blocks for critical rules or equations. "
            f"Use clean markdown formatting:\n\n{capped_text}"
        )
        
        notes_text = await llm.generate_async(prompt, system_instruction)
        result_data = {"notes": notes_text}
        
        new_content = GeneratedContent(
            document_id=document_id,
            content_type="notes",
            data=result_data
        )
        session.add(new_content)
        session.commit()
        
        return result_data
    except Exception as e:
        logger.error(f"Failed generating revision notes: {e}")
        raise HTTPException(status_code=500, detail=f"Revision notes generation failed: {str(e)}")
