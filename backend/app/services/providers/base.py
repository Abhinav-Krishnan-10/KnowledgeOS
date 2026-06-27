from typing import Optional

class LLMProvider:
    def generate(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        raise NotImplementedError
    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None, enable_web_search: bool = False) -> str:
        raise NotImplementedError
