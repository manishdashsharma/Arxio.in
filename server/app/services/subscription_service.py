from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.config import settings


async def activate_plan_service(user_id: str, access_key: str, plan: str) -> dict:
    if not settings.subscription_access_key:
        err = Exception("Subscription service is not configured")
        err.status_code = 503
        raise err

    if access_key != settings.subscription_access_key:
        err = Exception("Invalid access key")
        err.status_code = 403
        raise err

    db = get_database()
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "plan": plan,
                "is_subscribed": True,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return {"plan": plan, "is_subscribed": True}


async def get_subscription_service(user_id: str) -> dict:
    db = get_database()
    user = await db["users"].find_one(
        {"_id": ObjectId(user_id)},
        {"plan": 1, "is_subscribed": 1, "pdfs_used_this_month": 1, "research_used_this_month": 1, "chat_messages_used_this_month": 1},
    )
    if not user:
        err = Exception("User not found")
        err.status_code = 404
        raise err

    from app.models.plan import get_plan_limits
    limits = await get_plan_limits(user["plan"])

    return {
        "plan": user["plan"],
        "is_subscribed": user.get("is_subscribed", False),
        "usage": {
            "pdfs_used_this_month": user.get("pdfs_used_this_month", 0),
            "research_used_this_month": user.get("research_used_this_month", 0),
            "chat_messages_used_this_month": user.get("chat_messages_used_this_month", 0),
        },
        "limits": limits,
    }
