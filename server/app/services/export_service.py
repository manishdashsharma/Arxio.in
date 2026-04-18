import zipfile
from io import BytesIO
from pathlib import Path
from bson import ObjectId
from app.core.database import get_database
from app.models.workspace import COLLECTION
from app.models.research_job import COLLECTION as RESEARCH_COLLECTION
from app.shared.constant.application import EWorkspaceStatus, EResearchStatus

ALLOWED_FORMATS = {"pptx", "quick_pptx", "zip"}
PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


async def get_research_export_service(job_id: str, user_id: str, fmt: str) -> tuple[bytes, str, str]:
    if fmt not in ALLOWED_FORMATS:
        err = Exception(f"Format '{fmt}' not supported. Choose from: {', '.join(ALLOWED_FORMATS)}")
        err.status_code = 400
        raise err

    db = get_database()

    try:
        oid = ObjectId(job_id)
    except Exception:
        err = Exception("Invalid job ID")
        err.status_code = 400
        raise err

    job = await db[RESEARCH_COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1, "pptxPath": 1, "quickPptxPath": 1, "topic": 1},
    )

    if not job:
        err = Exception("Research job not found")
        err.status_code = 404
        raise err

    if job["status"] != EResearchStatus.COMPLETED:
        err = Exception("Research is not complete yet")
        err.status_code = 409
        raise err

    safe_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in job.get("topic", "research")[:50]).strip()

    if fmt == "pptx":
        return _serve_pptx(job.get("pptxPath"), f"{safe_name}_15slide.pptx")
    elif fmt == "quick_pptx":
        return _serve_pptx(job.get("quickPptxPath"), f"{safe_name}_5slide.pptx")
    else:
        return _serve_zip({"pptxPath": job.get("pptxPath"), "quickPptxPath": job.get("quickPptxPath")}, safe_name)


async def get_export_service(workspace_id: str, user_id: str, fmt: str) -> tuple[bytes, str, str]:
    if fmt not in ALLOWED_FORMATS:
        err = Exception(f"Format '{fmt}' not supported. Choose from: {', '.join(ALLOWED_FORMATS)}")
        err.status_code = 400
        raise err

    db = get_database()

    try:
        oid = ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1, "pptxPath": 1, "quickPptxPath": 1, "originalName": 1},
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    if workspace["status"] != EWorkspaceStatus.COMPLETED:
        err = Exception("Workspace processing is not complete yet")
        err.status_code = 409
        raise err

    base_name = Path(workspace.get("originalName", "paper")).stem

    if fmt == "pptx":
        return _serve_pptx(workspace.get("pptxPath"), f"{base_name}_15slide.pptx")
    elif fmt == "quick_pptx":
        return _serve_pptx(workspace.get("quickPptxPath"), f"{base_name}_5slide.pptx")
    else:
        return _serve_zip(workspace, base_name)


def _serve_pptx(path_str: str | None, filename: str) -> tuple[bytes, str, str]:
    if not path_str or not Path(path_str).exists():
        err = Exception("Presentation file not found. Please re-process this workspace.")
        err.status_code = 404
        raise err
    return Path(path_str).read_bytes(), filename, PPTX_MIME


def _serve_zip(workspace: dict, base_name: str) -> tuple[bytes, str, str]:
    pptx_path = workspace.get("pptxPath")
    quick_path = workspace.get("quickPptxPath")

    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        if pptx_path and Path(pptx_path).exists():
            zf.writestr(f"{base_name}_15slide.pptx", Path(pptx_path).read_bytes())
        if quick_path and Path(quick_path).exists():
            zf.writestr(f"{base_name}_5slide.pptx", Path(quick_path).read_bytes())

    return buf.getvalue(), f"{base_name}_arxio.zip", "application/zip"
