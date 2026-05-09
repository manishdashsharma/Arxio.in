import random
import string
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.redis import cache_set, cache_get, cache_del
from app.services.email_service import send_otp_email
from app.models.user import default_user_doc
from app.schemas.auth import (
    SignupRequest, LoginRequest, ForgotPasswordRequest,
    VerifyOtpRequest, ResetPasswordRequest, VerifyEmailRequest, ResendVerificationRequest,
)

OTP_TTL = 600


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _user_to_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "plan": user["plan"],
        "avatar": user.get("avatar"),
        "is_verified": user.get("is_verified", False),
        "is_subscribed": user.get("is_subscribed", False),
        "subscription": user.get("subscription", {}),
        "created_at": user["created_at"].isoformat(),
    }


def _generate_tokens(user: dict) -> dict:
    payload = {"sub": str(user["_id"]), "email": user["email"], "plan": user["plan"]}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
    }


async def signup_service(data: SignupRequest) -> dict:
    db = get_database()
    existing = await db["users"].find_one({"email": data.email, "is_active": True})
    if existing:
        err = Exception("An account with this email already exists")
        err.status_code = 409
        raise err

    doc = default_user_doc(data.name, data.email, hashed_password=hash_password(data.password))

    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id

    otp = _generate_otp()
    await cache_set(f"otp:email_verify:{data.email}", otp, OTP_TTL)
    await send_otp_email(
        data.email, data.name, otp,
        "Verify your Arxio account",
        "Use the code below to verify your email address.",
    )

    return {"email": data.email, "name": data.name}


async def login_service(data: LoginRequest) -> dict:
    db = get_database()
    user = await db["users"].find_one({"email": data.email, "is_active": True})
    if not user or not user.get("password") or not verify_password(data.password, user["password"]):
        err = Exception("Invalid email or password")
        err.status_code = 401
        raise err

    if not user.get("is_verified", False):
        err = Exception("Please verify your email before logging in")
        err.status_code = 403
        raise err

    tokens = _generate_tokens(user)
    return {**tokens, "user": _user_to_dict(user)}


async def refresh_token_service(refresh_token: str) -> dict:
    db = get_database()

    blacklisted = await cache_get(f"blacklist:refresh:{refresh_token}")
    if blacklisted:
        err = Exception("Token has been revoked")
        err.status_code = 401
        raise err

    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        err = Exception("Invalid token type")
        err.status_code = 401
        raise err

    user = await db["users"].find_one({"_id": ObjectId(payload["sub"]), "is_active": True})
    if not user:
        err = Exception("User not found")
        err.status_code = 404
        raise err

    tokens = _generate_tokens(user)
    return {**tokens, "user": _user_to_dict(user)}


async def me_service(user_id: str) -> dict:
    db = get_database()
    user = await db["users"].find_one(
        {"_id": ObjectId(user_id), "is_active": True},
        {"password": 0},
    )
    if not user:
        err = Exception("User not found")
        err.status_code = 404
        raise err
    return _user_to_dict(user)


async def logout_service(refresh_token: str) -> None:
    from app.core.config import settings
    payload = decode_token(refresh_token)
    exp = payload.get("exp", 0)
    now = int(datetime.utcnow().timestamp())
    ttl = max(exp - now, 1)
    await cache_set(f"blacklist:refresh:{refresh_token}", "1", ttl)


async def forgot_password_service(data: ForgotPasswordRequest) -> None:
    db = get_database()
    user = await db["users"].find_one({"email": data.email, "is_active": True}, {"name": 1, "email": 1})
    if not user:
        return

    otp = _generate_otp()
    await cache_set(f"otp:forgot_password:{data.email}", otp, OTP_TTL)
    await send_otp_email(
        data.email, user["name"], otp,
        "Reset your Arxio password",
        "Use the code below to reset your password.",
    )


async def verify_otp_service(data: VerifyOtpRequest) -> None:
    stored = await cache_get(f"otp:forgot_password:{data.email}")
    if not stored or stored != data.otp:
        err = Exception("Invalid or expired OTP")
        err.status_code = 400
        raise err


async def reset_password_service(data: ResetPasswordRequest) -> None:
    stored = await cache_get(f"otp:forgot_password:{data.email}")
    if not stored or stored != data.otp:
        err = Exception("Invalid or expired OTP")
        err.status_code = 400
        raise err

    db = get_database()
    result = await db["users"].update_one(
        {"email": data.email, "is_active": True},
        {"$set": {"password": hash_password(data.new_password), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        err = Exception("User not found")
        err.status_code = 404
        raise err

    await cache_del(f"otp:forgot_password:{data.email}")


async def verify_email_service(data: VerifyEmailRequest) -> dict:
    stored = await cache_get(f"otp:email_verify:{data.email}")
    if not stored or stored != data.otp:
        err = Exception("Invalid or expired OTP")
        err.status_code = 400
        raise err

    db = get_database()
    await db["users"].update_one(
        {"email": data.email, "is_active": True},
        {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}},
    )
    await cache_del(f"otp:email_verify:{data.email}")

    user = await db["users"].find_one({"email": data.email, "is_active": True})
    if not user:
        err = Exception("User not found")
        err.status_code = 404
        raise err

    tokens = _generate_tokens(user)
    return {**tokens, "user": _user_to_dict(user)}


async def resend_verification_service(data: ResendVerificationRequest) -> None:
    db = get_database()
    user = await db["users"].find_one(
        {"email": data.email, "is_active": True},
        {"name": 1, "email": 1, "is_verified": 1},
    )
    if not user:
        return

    if user.get("is_verified"):
        err = Exception("Email is already verified")
        err.status_code = 400
        raise err

    otp = _generate_otp()
    await cache_set(f"otp:email_verify:{data.email}", otp, OTP_TTL)
    await send_otp_email(
        data.email, user["name"], otp,
        "Verify your Arxio account",
        "Use the code below to verify your email address.",
    )
