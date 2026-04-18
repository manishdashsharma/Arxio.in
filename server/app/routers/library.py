from fastapi import APIRouter, Depends, Request, Query
from app.middleware.auth import get_current_user
from app.core.response import http_response, http_error, paginated_response
from app.schemas.library import SearchLibraryRequest
from app.services.library_service import get_library_service, search_library_service

router = APIRouter(prefix="/library", tags=["library"])


@router.get("/")
async def get_library(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await get_library_service(current_user["id"], page, limit)
        return paginated_response(
            request,
            "Library fetched",
            result["items"],
            result["pagination"]["total"],
            page,
            limit,
        )
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))


@router.post("/search")
async def search_library(
    request: Request,
    body: SearchLibraryRequest,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await search_library_service(current_user["id"], body.query, page, limit)
        return paginated_response(
            request,
            "Search results fetched",
            result["items"],
            result["pagination"]["total"],
            page,
            limit,
        )
    except Exception as e:
        return http_error(request, e, getattr(e, "status_code", 500))
