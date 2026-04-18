from app.core.database import get_database

COLLECTION = "users"


async def create_indexes() -> None:
    db = get_database()
    await db[COLLECTION].create_index([("email", 1), ("is_active", 1)], unique=True)


def user_collection():
    return get_database()[COLLECTION]


def default_user_doc(name: str, email: str, hashed_password: str | None = None, google_id: str | None = None) -> dict:
    from datetime import datetime
    now = datetime.utcnow()
    return {
        "name": name,
        "email": email,
        "password": hashed_password,
        "google_id": google_id,
        "avatar": None,
        "plan": "free",
        "is_active": True,
        "is_verified": False,
        "is_subscribed": False,
        "subscription": {},
        "pdfs_used_this_month": 0,
        "research_used_this_month": 0,
        "chat_messages_used_this_month": 0,
        "usage_reset_at": now,
        "created_at": now,
        "updated_at": now,
    }
