import logging
from typing import Optional
from app.services.providers.base import LLMProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(LLMProvider):
    """Mock OpenAI LLM Provider integration."""
    
    def __init__(self):
        logger.info("Initializing Mock OpenAI LLM Provider...")

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        return f"[Mock OpenAI] Response for prompt: '{prompt[:40]}...'. Full code is in rebuild_instructions.md."

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        return f"[Mock OpenAI Async] Response for prompt: '{prompt[:40]}...'. Full code is in rebuild_instructions.md."
