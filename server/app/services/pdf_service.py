import asyncio
import uuid
from pathlib import Path
from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile
from app.core.database import get_database
from app.core.redis import cache_get
from app.models.workspace import COLLECTION, default_workspace_doc
from app.shared.constant.application import EWorkspaceStatus

MAX_FILE_SIZE = 50 * 1024 * 1024
UPLOADS_DIR = Path(__file__).resolve().parents[3] / "uploads"


async def upload_pdf_service(user_id: str, file: UploadFile) -> dict:
    if file.content_type != "application/pdf":
        err = Exception("Only PDF files are accepted")
        err.status_code = 400
        raise err

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        err = Exception("File size exceeds the 50MB limit")
        err.status_code = 400
        raise err

    if len(file_bytes) < 1000:
        err = Exception("File appears to be empty or corrupted")
        err.status_code = 400
        raise err

    user_dir = UPLOADS_DIR / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    file_key = f"{user_id}/{uuid.uuid4()}.pdf"
    (UPLOADS_DIR / file_key).write_bytes(file_bytes)

    db = get_database()
    doc = default_workspace_doc(user_id, file_key, file.filename or "upload.pdf", len(file_bytes))

    result, _ = await asyncio.gather(
        db[COLLECTION].insert_one(doc),
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"pdfs_used_this_month": 1}},
        ),
    )

    return {
        "workspaceId": str(result.inserted_id),
        "originalName": doc["originalName"],
        "status": doc["status"],
        "fileSize": len(file_bytes),
        "createdAt": doc["createdAt"].isoformat(),
    }


async def process_pdf_service(workspace_id: str, user_id: str, plan_tier: str) -> dict:
    db = get_database()

    try:
        oid = ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1},
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    if workspace["status"] in (EWorkspaceStatus.PROCESSING, EWorkspaceStatus.COMPLETED):
        err = Exception(f"Workspace is already {workspace['status']}")
        err.status_code = 409
        raise err

    from app.workers.tasks import process_pdf_task
    task = process_pdf_task.delay(workspace_id, user_id, plan_tier)

    await db[COLLECTION].update_one(
        {"_id": oid},
        {"$set": {"celeryTaskId": task.id, "status": EWorkspaceStatus.PROCESSING, "updatedAt": datetime.utcnow()}},
    )

    return {"workspaceId": workspace_id, "taskId": task.id}


async def get_workspace_status_service(workspace_id: str, user_id: str) -> dict:
    db = get_database()

    try:
        oid = ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1, "errorMessage": 1, "pageCount": 1, "wordCount": 1, "processingStep": 1, "processingPercent": 1},
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    status = workspace["status"]

    if status in ("completed", "failed"):
        step = workspace.get("processingStep")
        percent = workspace.get("processingPercent", 0)
    else:
        progress = await cache_get(f"workspace:progress:{workspace_id}") or {}
        step = progress.get("step") or workspace.get("processingStep")
        percent = progress.get("percent") or workspace.get("processingPercent", 0)

    return {
        "workspaceId": workspace_id,
        "status": status,
        "step": step,
        "percent": percent,
        "errorMessage": workspace.get("errorMessage"),
        "pageCount": workspace.get("pageCount"),
        "wordCount": workspace.get("wordCount"),
    }


async def get_workspace_service(workspace_id: str, user_id: str) -> dict:
    db = get_database()

    try:
        oid = ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {
            "originalName": 1,
            "fileSize": 1,
            "status": 1,
            "pageCount": 1,
            "wordCount": 1,
            "analysis": 1,
            "pptxPath": 1,
            "quickPptxPath": 1,
            "createdAt": 1,
            "updatedAt": 1,
        },
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    workspace["workspaceId"] = str(workspace.pop("_id"))
    workspace["createdAt"] = workspace["createdAt"].isoformat()
    workspace["updatedAt"] = workspace["updatedAt"].isoformat()
    workspace["hasPptx"] = workspace.get("pptxPath") is not None
    workspace["hasQuickPptx"] = workspace.get("quickPptxPath") is not None
    workspace.pop("pptxPath", None)
    workspace.pop("quickPptxPath", None)
    return workspace


async def list_workspaces_service(user_id: str, page: int, limit: int) -> dict:
    db = get_database()
    filter_query = {"userId": user_id, "isActive": True}
    skip = (page - 1) * limit

    total, workspaces = await asyncio.gather(
        db[COLLECTION].count_documents(filter_query),
        db[COLLECTION]
        .find(filter_query, {"originalName": 1, "status": 1, "pageCount": 1, "fileSize": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit),
    )

    items = [
        {
            "workspaceId": str(w["_id"]),
            "originalName": w["originalName"],
            "status": w["status"],
            "pageCount": w.get("pageCount"),
            "fileSize": w["fileSize"],
            "createdAt": w["createdAt"].isoformat(),
        }
        for w in workspaces
    ]

    has_next = (page - 1) * limit + len(items) < total
    return {
        "items": items,
        "pagination": {"total": total, "page": page, "limit": limit, "hasNextPage": has_next},
    }
