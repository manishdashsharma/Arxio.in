import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.logger import logger

_client: AsyncOpenAI | None = None

MODEL_MINI = "gpt-4o-mini"
MODEL_FULL = "gpt-4o"


def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def generate_text(system_prompt: str, user_content: str, model: str = MODEL_FULL) -> str:
    client = get_openai_client()
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.5,
            max_tokens=2000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error("OpenAI generate_text failed [%s] — %s", model, str(e))
        err = Exception("AI service unavailable. Please try again.")
        err.status_code = 502
        raise err


async def generate(system_prompt: str, user_content: str, model: str = MODEL_FULL) -> dict:
    client = get_openai_client()

    for attempt in range(2):
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.3,
                max_tokens=16000,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
            return json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error("OpenAI JSON parse failed [%s] attempt %d — %s", model, attempt + 1, str(e))
            if attempt == 1:
                err = Exception("AI returned malformed response. Please try again.")
                err.status_code = 502
                raise err
        except Exception as e:
            logger.error("OpenAI generate failed [%s] — %s", model, str(e))
            err = Exception("AI service unavailable. Please try again.")
            err.status_code = 502
            raise err
