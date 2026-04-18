from fastapi import APIRouter, Depends, Request, Query
from app.middleware.auth import get_current_user
from app.middleware.plan_guard import require_usage
from app.core.response import http_response, http_error, paginated_response
from app.schemas.chat import SendMessageRequest
from app.services.chat_service import send_message_service, get_chat_history_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message")
async def send_message(
    request: Request,
    body: SendMessageRequest,
    current_user: dict = Depends(require_usage("chat_messages")),
):
    try:
        result = await send_message_service(
            current_user["id"],
            body.workspaceId,
            body.message,
            current_user["plan"],
        )
        return http_response(request, 200, "Message sent", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/{workspace_id}/history")
async def get_history(
    request: Request,
    workspace_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_chat_history_service(current_user["id"], workspace_id, page, limit)
        return paginated_response(
            request,
            "Chat history fetched",
            result["items"],
            result["pagination"]["total"],
            page,
            limit,
        )
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
