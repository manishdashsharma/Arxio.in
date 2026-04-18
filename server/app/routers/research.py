from fastapi import APIRouter, Depends, Request, Query
from app.middleware.auth import get_current_user
from app.middleware.plan_guard import require_usage
from app.core.response import http_response, http_error, paginated_response
from app.schemas.research import GenerateResearchRequest
from app.services.research_service import (
    create_research_service,
    get_research_status_service,
    get_research_service,
    list_research_service,
)

router = APIRouter(prefix="/research", tags=["research"])


@router.post("/generate")
async def generate_research(
    request: Request,
    body: GenerateResearchRequest,
    current_user: dict = Depends(require_usage("research_per_month")),
):
    try:
        result = await create_research_service(current_user["id"], body.topic, current_user["plan"])
        return http_response(request, 202, "Research started", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/{job_id}/status")
async def get_status(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_research_status_service(job_id, current_user["id"])
        return http_response(request, 200, "Status fetched", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/{job_id}")
async def get_research(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_research_service(job_id, current_user["id"])
        return http_response(request, 200, "Research fetched", {"research": result})
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/")
async def list_research(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await list_research_service(current_user["id"], page, limit)
        return paginated_response(
            request,
            "Research jobs fetched",
            result["items"],
            result["pagination"]["total"],
            page,
            limit,
        )
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
