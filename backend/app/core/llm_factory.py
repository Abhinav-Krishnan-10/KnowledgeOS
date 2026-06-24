from app.core.config import settings
from app.services.providers.base import LLMProvider
from app.services.providers.gemini import GeminiProvider
from app.services.providers.openai import OpenAIProvider
from app.services.providers.ollama import OllamaProvider

def get_llm_provider() -> LLMProvider:
    """Factory to retrieve the configured LLM Provider."""
    provider_name = settings.LLM_PROVIDER.lower().strip()
    
    if provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "ollama":
        return OllamaProvider()
    else:
        raise ValueError(
            f"Unsupported LLM_PROVIDER: '{settings.LLM_PROVIDER}'. "
            "Supported options are 'gemini', 'openai', and 'ollama'."
        )
