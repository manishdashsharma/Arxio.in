from fastapi import Depends, HTTPException, Request
from app.middleware.auth import get_current_user
from app.models.plan import get_plan_limits
from app.core.database import get_database
from bson import ObjectId


def require_feature(feature: str):
    async def guard(
        request: Request,
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        limits = await get_plan_limits(current_user["plan"])
        if not limits.get(feature, False):
            raise HTTPException(
                status_code=403,
                detail=f"'{feature}' is not available on your current plan. Please upgrade.",
            )
        return current_user
    return guard


def require_usage(usage_field: str):
    USAGE_TO_DB_FIELD = {
        "pdfs_per_month": "pdfs_used_this_month",
        "research_per_month": "research_used_this_month",
        "chat_messages": "chat_messages_used_this_month",
    }

    async def guard(
        request: Request,
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        limits = await get_plan_limits(current_user["plan"])
        limit = limits.get(usage_field, 0)

        if limit == -1:
            return current_user

        db_field = USAGE_TO_DB_FIELD.get(usage_field)
        if not db_field:
            return current_user

        db = get_database()
        user = await db["users"].find_one(
            {"_id": ObjectId(current_user["id"])},
            {db_field: 1, "_id": 0},
        )
        used = user.get(db_field, 0) if user else 0

        if used >= limit:
            raise HTTPException(
                status_code=403,
                detail=f"You have reached your {usage_field.replace('_', ' ')} limit for this month. Please upgrade.",
            )

        return current_user
    return guard
