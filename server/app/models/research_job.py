from datetime import datetime
from app.core.database import get_database
from app.shared.constant.application import EResearchStatus

COLLECTION = "research_jobs"


async def ensure_research_indexes() -> None:
    db = get_database()
    await db[COLLECTION].create_index([("userId", 1), ("isActive", 1)])
    await db[COLLECTION].create_index([("userId", 1), ("createdAt", -1)])


def default_research_job_doc(user_id: str, topic: str) -> dict:
    now = datetime.utcnow()
    return {
        "userId": user_id,
        "topic": topic,
        "status": EResearchStatus.PENDING,
        "processingStep": None,
        "processingPercent": 0,
        "analysis": None,
        "pptxPath": None,
        "quickPptxPath": None,
        "celeryTaskId": None,
        "errorMessage": None,
        "isActive": True,
        "createdAt": now,
        "updatedAt": now,
    }
