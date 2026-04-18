from app.services.ai import openai_client
from app.services.ai.openai_client import MODEL_MINI, MODEL_FULL

_MODEL_MAP = {
    "free":    MODEL_MINI,
    "student": MODEL_MINI,
    "pro":     MODEL_FULL,
    "scholar": MODEL_FULL,
}


def _model(plan: str) -> str:
    return _MODEL_MAP.get(plan, MODEL_MINI)


async def generate(plan: str, system_prompt: str, user_content: str) -> dict:
    return await openai_client.generate(system_prompt, user_content, model=_model(plan))


async def generate_chat(plan: str, system_prompt: str, user_content: str) -> str:
    return await openai_client.generate_text(system_prompt, user_content, model=_model(plan))
