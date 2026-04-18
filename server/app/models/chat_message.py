from datetime import datetime
from app.core.database import get_database

COLLECTION = "chat_messages"


async def ensure_chat_indexes() -> None:
    db = get_database()
    await db[COLLECTION].create_index([("workspaceId", 1), ("userId", 1), ("isActive", 1)])
    await db[COLLECTION].create_index([("workspaceId", 1), ("createdAt", 1)])


def default_chat_message_doc(workspace_id: str, user_id: str, role: str, content: str) -> dict:
    now = datetime.utcnow()
    return {
        "workspaceId": workspace_id,
        "userId": user_id,
        "role": role,
        "content": content,
        "isActive": True,
        "createdAt": now,
    }
