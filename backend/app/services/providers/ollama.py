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

    def generate(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
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

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
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
