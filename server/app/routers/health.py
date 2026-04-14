from fastapi import APIRouter, Request
from app.core.response import http_response, responseMessage
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check(request: Request):
    return http_response(
        request,
        200,
        responseMessage.SUCCESS.HEALTH_CHECK,
        {
            "app": settings.app_name,
            "version": settings.version,
            "environment": settings.environment,
        },
    )
