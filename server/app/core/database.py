from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.core.logger import logger

_client: AsyncIOMotorClient | None = None


async def connect_database() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    await _client.admin.command("ping")
    logger.info("MongoDB connected — %s", settings.mongodb_db_name)


async def disconnect_database() -> None:
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB disconnected")


def get_database() -> AsyncIOMotorDatabase:
    return _client[settings.mongodb_db_name]
