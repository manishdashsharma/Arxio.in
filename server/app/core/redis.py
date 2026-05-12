import json
from typing import Any
from redis.asyncio import Redis
from app.core.config import settings
from app.core.logger import logger


def get_redis_client() -> Redis:
    return Redis.from_url(settings.redis_url, decode_responses=True)


async def cache_set(key: str, value: Any, ttl: int) -> None:
    try:
        client = get_redis_client()
        await client.set(key, json.dumps(value), ex=ttl)
    except Exception as e:
        logger.error("Redis cache_set failed — %s", str(e))


async def cache_get(key: str) -> Any | None:
    try:
        client = get_redis_client()
        data = await client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        logger.error("Redis cache_get failed — %s", str(e))
        return None


async def cache_del(key: str) -> None:
    try:
        client = get_redis_client()
        await client.delete(key)
    except Exception as e:
        logger.error("Redis cache_del failed — %s", str(e))


async def cache_exists(key: str) -> bool:
    try:
        client = get_redis_client()
        return bool(await client.exists(key))
    except Exception as e:
        logger.error("Redis cache_exists failed — %s", str(e))
        return False
