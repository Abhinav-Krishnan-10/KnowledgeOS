from app.core.config import settings
from app.services.providers.base import LLMProvider
from app.services.providers.gemini import GeminiProvider
from app.services.providers.openai import OpenAIProvider
from app.services.providers.ollama import OllamaProvider

from typing import Optional

def get_llm_provider(provider_name: Optional[str] = None, api_key: Optional[str] = None) -> LLMProvider:
    """Factory to retrieve the configured LLM Provider, supporting optional dynamic overrides."""
    name = (provider_name or settings.LLM_PROVIDER).lower().strip()
    
    if name == "gemini":
        return GeminiProvider(api_key=api_key)
    elif name == "openai":
        return OpenAIProvider(api_key=api_key)
    elif name == "ollama":
        return OllamaProvider()
    else:
        raise ValueError(
            f"Unsupported LLM_PROVIDER: '{name}'. "
            "Supported options are 'gemini', 'openai', and 'ollama'."
        )
