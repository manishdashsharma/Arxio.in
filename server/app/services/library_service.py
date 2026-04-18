import asyncio
import re
from app.core.database import get_database
from app.models.workspace import COLLECTION as WORKSPACE_COLLECTION
from app.models.research_job import COLLECTION as RESEARCH_COLLECTION


def _serialize_workspace(w: dict) -> dict:
    return {
        "id": str(w["_id"]),
        "type": "pdf",
        "title": w.get("originalName", "Untitled"),
        "status": w.get("status"),
        "pageCount": w.get("pageCount"),
        "fileSize": w.get("fileSize"),
        "createdAt": w["createdAt"].isoformat(),
    }


def _serialize_research(j: dict) -> dict:
    return {
        "id": str(j["_id"]),
        "type": "research",
        "title": j.get("topic", "Untitled"),
        "status": j.get("status"),
        "createdAt": j["createdAt"].isoformat(),
    }


async def get_library_service(user_id: str, page: int, limit: int) -> dict:
    db = get_database()
    skip = (page - 1) * limit

    ws_filter = {"userId": user_id, "isActive": True}
    rj_filter = {"userId": user_id, "isActive": True}

    ws_total, rj_total, workspaces, research_jobs = await asyncio.gather(
        db[WORKSPACE_COLLECTION].count_documents(ws_filter),
        db[RESEARCH_COLLECTION].count_documents(rj_filter),
        db[WORKSPACE_COLLECTION]
        .find(ws_filter, {"originalName": 1, "status": 1, "pageCount": 1, "fileSize": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .to_list(None),
        db[RESEARCH_COLLECTION]
        .find(rj_filter, {"topic": 1, "status": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .to_list(None),
    )

    all_items = [_serialize_workspace(w) for w in workspaces] + [_serialize_research(j) for j in research_jobs]
    all_items.sort(key=lambda x: x["createdAt"], reverse=True)

    total = ws_total + rj_total
    paginated = all_items[skip: skip + limit]
    has_next = skip + len(paginated) < total

    return {
        "items": paginated,
        "pagination": {"total": total, "page": page, "limit": limit, "hasNextPage": has_next},
    }


async def search_library_service(user_id: str, query: str, page: int, limit: int) -> dict:
    db = get_database()
    skip = (page - 1) * limit
    pattern = re.compile(query, re.IGNORECASE)

    ws_filter = {"userId": user_id, "isActive": True, "originalName": {"$regex": pattern}}
    rj_filter = {"userId": user_id, "isActive": True, "topic": {"$regex": pattern}}

    ws_total, rj_total, workspaces, research_jobs = await asyncio.gather(
        db[WORKSPACE_COLLECTION].count_documents(ws_filter),
        db[RESEARCH_COLLECTION].count_documents(rj_filter),
        db[WORKSPACE_COLLECTION]
        .find(ws_filter, {"originalName": 1, "status": 1, "pageCount": 1, "fileSize": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .to_list(None),
        db[RESEARCH_COLLECTION]
        .find(rj_filter, {"topic": 1, "status": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .to_list(None),
    )

    all_items = [_serialize_workspace(w) for w in workspaces] + [_serialize_research(j) for j in research_jobs]
    all_items.sort(key=lambda x: x["createdAt"], reverse=True)

    total = ws_total + rj_total
    paginated = all_items[skip: skip + limit]
    has_next = skip + len(paginated) < total

    return {
        "items": paginated,
        "pagination": {"total": total, "page": page, "limit": limit, "hasNextPage": has_next},
    }
