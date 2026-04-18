from datetime import datetime
from app.core.database import get_database
from app.shared.constant.application import EWorkspaceStatus

COLLECTION = "workspaces"


def workspace_indexes() -> list[dict]:
    return [
        {"key": [("userId", 1), ("isActive", 1)]},
        {"key": [("userId", 1), ("createdAt", -1)]},
    ]


def default_workspace_doc(user_id: str, file_key: str, original_name: str, file_size: int) -> dict:
    now = datetime.utcnow()
    return {
        "userId": user_id,
        "originalName": original_name,
        "fileKey": file_key,
        "fileSize": file_size,
        "status": EWorkspaceStatus.PENDING,
        "processingStep": None,
        "processingPercent": 0,
        "pageCount": None,
        "wordCount": None,
        "analysis": None,
        "pptxPath": None,
        "quickPptxPath": None,
        "celeryTaskId": None,
        "errorMessage": None,
        "isActive": True,
        "createdAt": now,
        "updatedAt": now,
    }


async def ensure_indexes() -> None:
    db = get_database()
    for index in workspace_indexes():
        await db[COLLECTION].create_index(index["key"])
