from typing import Optional

class LLMProvider:
    """Base abstraction class for LLM Providers."""
    
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Synchronously generates a response from the LLM."""
        raise NotImplementedError("Subclasses must implement generate")

    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Asynchronously generates a response from the LLM."""
        raise NotImplementedError("Subclasses must implement generate_async")
