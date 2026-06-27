import logging
from typing import Optional
from openai import OpenAI, AsyncOpenAI
from app.services.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or settings.OPENAI_API_KEY
        if not key:
            raise ValueError("OPENAI_API_KEY is not configured.")
        self.client = OpenAI(api_key=key)
        self.async_client = AsyncOpenAI(api_key=key)
        self.model = "gpt-4o"

    def generate(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        try:
            messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
            messages.append({"role": "user", "content": prompt})
            response = self.client.chat.completions.create(model=self.model, messages=messages)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generate failed: {e}")
            raise e

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        try:
            messages = [{"role": "system", "content": system_instruction}] if system_instruction else []
            messages.append({"role": "user", "content": prompt})
            response = await self.async_client.chat.completions.create(model=self.model, messages=messages)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generate_async failed: {e}")
            raise e
