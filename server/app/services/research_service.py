import asyncio
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.redis import cache_get
from app.models.research_job import COLLECTION, default_research_job_doc
from app.shared.constant.application import EResearchStatus


async def create_research_service(user_id: str, topic: str, plan_tier: str) -> dict:
    db = get_database()
    doc = default_research_job_doc(user_id, topic)

    result, _ = await asyncio.gather(
        db[COLLECTION].insert_one(doc),
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"research_used_this_month": 1}},
        ),
    )

    job_id = str(result.inserted_id)

    from app.workers.tasks import generate_research_task
    task = generate_research_task.delay(job_id, user_id, plan_tier)

    await db[COLLECTION].update_one(
        {"_id": result.inserted_id},
        {"$set": {"celeryTaskId": task.id, "status": EResearchStatus.PROCESSING, "updatedAt": datetime.utcnow()}},
    )

    return {"jobId": job_id, "taskId": task.id, "topic": topic}


async def get_research_status_service(job_id: str, user_id: str) -> dict:
    db = get_database()

    try:
        oid = ObjectId(job_id)
    except Exception:
        err = Exception("Invalid job ID")
        err.status_code = 400
        raise err

    job = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1, "errorMessage": 1, "processingStep": 1, "processingPercent": 1},
    )

    if not job:
        err = Exception("Research job not found")
        err.status_code = 404
        raise err

    status = job["status"]

    if status in ("completed", "failed"):
        step = job.get("processingStep")
        percent = job.get("processingPercent", 0)
    else:
        progress = await cache_get(f"research:progress:{job_id}") or {}
        step = progress.get("step") or job.get("processingStep")
        percent = progress.get("percent") or job.get("processingPercent", 0)

    return {
        "jobId": job_id,
        "status": status,
        "step": step,
        "percent": percent,
        "errorMessage": job.get("errorMessage"),
    }


async def get_research_service(job_id: str, user_id: str) -> dict:
    db = get_database()

    try:
        oid = ObjectId(job_id)
    except Exception:
        err = Exception("Invalid job ID")
        err.status_code = 400
        raise err

    job = await db[COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {
            "topic": 1,
            "status": 1,
            "analysis": 1,
            "pptxPath": 1,
            "quickPptxPath": 1,
            "createdAt": 1,
            "updatedAt": 1,
        },
    )

    if not job:
        err = Exception("Research job not found")
        err.status_code = 404
        raise err

    job["jobId"] = str(job.pop("_id"))
    job["createdAt"] = job["createdAt"].isoformat()
    job["updatedAt"] = job["updatedAt"].isoformat()
    job["hasPptx"] = job.get("pptxPath") is not None
    job["hasQuickPptx"] = job.get("quickPptxPath") is not None
    job.pop("pptxPath", None)
    job.pop("quickPptxPath", None)
    return job


async def list_research_service(user_id: str, page: int, limit: int) -> dict:
    db = get_database()
    filter_query = {"userId": user_id, "isActive": True}
    skip = (page - 1) * limit

    total, jobs = await asyncio.gather(
        db[COLLECTION].count_documents(filter_query),
        db[COLLECTION]
        .find(filter_query, {"topic": 1, "status": 1, "createdAt": 1})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit),
    )

    items = [
        {
            "jobId": str(j["_id"]),
            "topic": j["topic"],
            "status": j["status"],
            "createdAt": j["createdAt"].isoformat(),
        }
        for j in jobs
    ]

    has_next = (page - 1) * limit + len(items) < total
    return {
        "items": items,
        "pagination": {"total": total, "page": page, "limit": limit, "hasNextPage": has_next},
    }
