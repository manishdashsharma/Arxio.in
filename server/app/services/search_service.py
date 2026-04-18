import httpx
from app.core.config import settings
from app.core.logger import logger

TAVILY_URL = "https://api.tavily.com/search"


async def search_web(topic: str, max_results: int = 10) -> str:
    if not settings.tavily_api_key:
        err = Exception("Search service is not configured")
        err.status_code = 503
        raise err

    payload = {
        "api_key": settings.tavily_api_key,
        "query": topic,
        "search_depth": "advanced",
        "include_answer": True,
        "include_raw_content": False,
        "max_results": max_results,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(TAVILY_URL, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error("Tavily HTTP error — %s", str(e))
        err = Exception("Web search failed. Please try again.")
        err.status_code = 502
        raise err
    except Exception as e:
        logger.error("Tavily search failed — %s", str(e))
        err = Exception("Web search unavailable. Please try again.")
        err.status_code = 502
        raise err

    parts = []

    if data.get("answer"):
        parts.append(f"Summary: {data['answer']}\n")

    for result in data.get("results", []):
        title = result.get("title", "")
        url = result.get("url", "")
        content = result.get("content", "")
        if content:
            parts.append(f"Source: {title}\nURL: {url}\n{content}\n")

    return "\n---\n".join(parts)
