from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.middleware.auth import get_current_user
from app.models.plan import get_plan_limits
from app.services.export_service import get_export_service, get_research_export_service

router = APIRouter(prefix="/export", tags=["export"])

_PPT_FORMATS = {"pptx", "quick_pptx"}


@router.get("/research/{job_id}/{fmt}")
async def export_research_file(
    job_id: str,
    fmt: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        if fmt in _PPT_FORMATS:
            limits = await get_plan_limits(current_user["plan"])
            if not limits.get("ppt", False):
                err = Exception("PPT export is not available on your current plan. Please upgrade.")
                err.status_code = 403
                raise err

        file_bytes, filename, media_type = await get_research_export_service(
            job_id, current_user["id"], fmt
        )
        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=getattr(e, "status_code", 500), detail=str(e))


@router.get("/{workspace_id}/{fmt}")
async def export_file(
    workspace_id: str,
    fmt: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        if fmt in _PPT_FORMATS:
            limits = await get_plan_limits(current_user["plan"])
            if not limits.get("ppt", False):
                err = Exception("PPT export is not available on your current plan. Please upgrade.")
                err.status_code = 403
                raise err

        file_bytes, filename, media_type = await get_export_service(
            workspace_id, current_user["id"], fmt
        )
        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=getattr(e, "status_code", 500), detail=str(e))
