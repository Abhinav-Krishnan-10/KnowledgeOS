import logging
from typing import Optional
from google import genai
from google.genai import types
from app.services.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or settings.GEMINI_API_KEY
        if not key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        self.client = genai.Client(api_key=key)
        self.model = "gemini-2.5-flash"

    def generate(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        try:
            tools = [types.Tool(google_search=types.GoogleSearch())] if enable_web_search else None
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools
            )
            response = self.client.models.generate_content(model=self.model, contents=prompt, config=config)
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generate failed: {e}")
            raise e

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        try:
            tools = [types.Tool(google_search=types.GoogleSearch())] if enable_web_search else None
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools
            )
            response = await self.client.aio.models.generate_content(model=self.model, contents=prompt, config=config)
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generate_async failed: {e}")
            raise e
