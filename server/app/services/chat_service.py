import asyncio
import json
from bson import ObjectId
from app.core.database import get_database
from app.models.workspace import COLLECTION as WORKSPACE_COLLECTION
from app.models.chat_message import COLLECTION as CHAT_COLLECTION, default_chat_message_doc
from app.services.ai import router as ai_router
from app.services.ai.prompts import CHAT_WITH_PAPER_SYSTEM_PROMPT


async def send_message_service(user_id: str, workspace_id: str, message: str, plan_tier: str = "free") -> dict:
    db = get_database()

    try:
        oid = ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[WORKSPACE_COLLECTION].find_one(
        {"_id": oid, "userId": user_id, "isActive": True},
        {"status": 1, "analysis": 1},
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    if workspace.get("status") != "completed":
        err = Exception("Workspace is not ready yet. Wait for processing to complete.")
        err.status_code = 409
        raise err

    analysis = workspace.get("analysis")
    if not analysis:
        err = Exception("Workspace analysis is missing. Please re-process.")
        err.status_code = 409
        raise err

    if plan_tier == "scholar":
        try:
            from app.services.rag import search_workspace
            rag_chunks = await search_workspace(workspace_id, message)
            context = rag_chunks if rag_chunks else (json.dumps(analysis) if isinstance(analysis, dict) else str(analysis))
        except Exception as rag_err:
            from app.core.logger import logger
            logger.error("RAG search failed — workspace %s — %s", workspace_id, str(rag_err))
            context = json.dumps(analysis) if isinstance(analysis, dict) else str(analysis)
    else:
        context = json.dumps(analysis) if isinstance(analysis, dict) else str(analysis)

    system_prompt = CHAT_WITH_PAPER_SYSTEM_PROMPT.format(paper_analysis=context)

    user_doc = default_chat_message_doc(workspace_id, user_id, "user", message)

    await asyncio.gather(
        db[CHAT_COLLECTION].insert_one(user_doc),
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"chat_messages_used_this_month": 1}},
        ),
    )

    reply = await ai_router.generate_chat(plan_tier, system_prompt, message)

    assistant_doc = default_chat_message_doc(workspace_id, user_id, "assistant", reply)
    await db[CHAT_COLLECTION].insert_one(assistant_doc)

    return {
        "role": "assistant",
        "content": reply,
        "workspaceId": workspace_id,
    }


async def get_chat_history_service(user_id: str, workspace_id: str, page: int, limit: int) -> dict:
    db = get_database()

    try:
        ObjectId(workspace_id)
    except Exception:
        err = Exception("Invalid workspace ID")
        err.status_code = 400
        raise err

    workspace = await db[WORKSPACE_COLLECTION].find_one(
        {"_id": ObjectId(workspace_id), "userId": user_id, "isActive": True},
        {"_id": 1},
    )

    if not workspace:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err

    filter_query = {"workspaceId": workspace_id, "userId": user_id, "isActive": True}
    skip = (page - 1) * limit

    total, messages = await asyncio.gather(
        db[CHAT_COLLECTION].count_documents(filter_query),
        db[CHAT_COLLECTION]
        .find(filter_query, {"role": 1, "content": 1, "createdAt": 1})
        .sort("createdAt", 1)
        .skip(skip)
        .limit(limit)
        .to_list(limit),
    )

    items = [
        {
            "messageId": str(m["_id"]),
            "role": m["role"],
            "content": m["content"],
            "createdAt": m["createdAt"].isoformat(),
        }
        for m in messages
    ]

    has_next = (page - 1) * limit + len(items) < total
    return {
        "items": items,
        "pagination": {"total": total, "page": page, "limit": limit, "hasNextPage": has_next},
    }
