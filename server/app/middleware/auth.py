from bson import ObjectId
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.core.database import get_database

_bearer = HTTPBearer()


async def get_current_user(request: Request) -> dict:
    credentials: HTTPAuthorizationCredentials = await _bearer(request)
    payload = decode_token(credentials.credentials)

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    db = get_database()
    user = await db["users"].find_one(
        {"_id": ObjectId(payload["sub"]), "is_active": True},
        {"password": 0},
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "plan": user["plan"],
    }
