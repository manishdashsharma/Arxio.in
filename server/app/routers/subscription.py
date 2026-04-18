from fastapi import APIRouter, Depends, Request
from app.middleware.auth import get_current_user
from app.core.response import http_response, http_error
from app.schemas.subscription import ActivatePlanRequest
from app.services.subscription_service import activate_plan_service, get_subscription_service
from app.models.plan import get_all_plans

router = APIRouter(prefix="/subscription", tags=["subscription"])


@router.get("/plans")
async def list_plans(request: Request):
    try:
        plans = await get_all_plans()
        return http_response(request, 200, "Plans fetched", {"plans": plans})
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/")
async def get_subscription(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_subscription_service(current_user["id"])
        return http_response(request, 200, "Subscription fetched", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/activate")
async def activate_plan(
    request: Request,
    body: ActivatePlanRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await activate_plan_service(current_user["id"], body.access_key, body.plan)
        return http_response(request, 200, f"Plan upgraded to {body.plan}", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
