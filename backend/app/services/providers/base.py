from typing import Optional

class LLMProvider:
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        raise NotImplementedError
    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        raise NotImplementedError
