from fastapi import APIRouter, Depends, Request, UploadFile, File, Query
from app.middleware.auth import get_current_user
from app.middleware.plan_guard import require_usage
from app.core.response import http_response, http_error, paginated_response
from app.services.pdf_service import (
    upload_pdf_service,
    process_pdf_service,
    get_workspace_service,
    get_workspace_status_service,
    list_workspaces_service,
)

router = APIRouter(prefix="/pdf", tags=["pdf"])


@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_usage("pdfs_per_month")),
):
    try:
        result = await upload_pdf_service(current_user["id"], file)
        return http_response(request, 201, "PDF uploaded successfully", {"workspace": result})
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/{workspace_id}/process")
async def process_pdf(
    request: Request,
    workspace_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await process_pdf_service(workspace_id, current_user["id"], current_user["plan"])
        return http_response(request, 202, "Processing started", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/{workspace_id}/status")
async def get_status(
    request: Request,
    workspace_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_workspace_status_service(workspace_id, current_user["id"])
        return http_response(request, 200, "Status fetched", result)
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/{workspace_id}")
async def get_workspace(
    request: Request,
    workspace_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_workspace_service(workspace_id, current_user["id"])
        return http_response(request, 200, "Workspace fetched", {"workspace": result})
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.get("/")
async def list_workspaces(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await list_workspaces_service(current_user["id"], page, limit)
        return paginated_response(
            request,
            "Workspaces fetched",
            result["items"],
            result["pagination"]["total"],
            page,
            limit,
        )
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
