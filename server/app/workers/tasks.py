import asyncio
from datetime import datetime
from pathlib import Path
from bson import ObjectId
from app.workers.celery_app import celery_app
from app.core.logger import logger

import os

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", str(Path(__file__).resolve().parents[3] / "uploads")))
GENERATED_DIR = Path(os.getenv("GENERATED_DIR", str(Path(__file__).resolve().parents[3] / "generated")))


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="process_pdf_task", max_retries=1)
def process_pdf_task(self, workspace_id: str, user_id: str, plan_tier: str):
    _run(_process_pdf(workspace_id, user_id, plan_tier))


@celery_app.task(bind=True, name="generate_research_task", max_retries=1)
def generate_research_task(self, job_id: str, user_id: str, plan_tier: str):
    _run(_generate_research(job_id, user_id, plan_tier))


async def _set_progress(db, workspace_id: str, step: str, percent: int):
    from app.core.redis import cache_set
    await cache_set(
        f"workspace:progress:{workspace_id}",
        {"step": step, "percent": percent},
        ttl=600,
    )
    await db["workspaces"].update_one(
        {"_id": ObjectId(workspace_id)},
        {"$set": {"processingStep": step, "processingPercent": percent, "updatedAt": datetime.utcnow()}},
    )


async def _process_pdf(workspace_id: str, user_id: str, plan_tier: str):
    from app.core.database import connect_database, get_database
    from app.services.pdf_processor import extract_pdf_content
    from app.services.ai import router as ai_router
    from app.services.ai.prompts import PDF_ANALYSIS_SYSTEM_PROMPT
    from app.services.generators.ppt_generator import generate_pptx, generate_quick_pptx
    from app.shared.constant.application import EWorkspaceStatus

    await connect_database()
    db = get_database()

    await db["workspaces"].update_one(
        {"_id": ObjectId(workspace_id)},
        {"$set": {"status": EWorkspaceStatus.PROCESSING, "updatedAt": datetime.utcnow()}},
    )

    try:
        await _set_progress(db, workspace_id, "Reading your paper...", 10)

        workspace = await db["workspaces"].find_one(
            {"_id": ObjectId(workspace_id), "userId": user_id, "isActive": True},
            {"fileKey": 1},
        )
        if not workspace:
            raise Exception("Workspace not found")

        file_bytes = (UPLOADS_DIR / workspace["fileKey"]).read_bytes()

        await _set_progress(db, workspace_id, "Extracting text and tables...", 20)
        content = extract_pdf_content(file_bytes)

        await _set_progress(db, workspace_id, "Analysing the methodology...", 35)

        from app.services.pdf_processor import build_user_content
        user_content = build_user_content(content, plan_tier)

        await _set_progress(db, workspace_id, "AI is reading the full paper...", 45)
        analysis = await ai_router.generate(plan_tier, PDF_ANALYSIS_SYSTEM_PROMPT, user_content)

        if plan_tier == "scholar":
            await _set_progress(db, workspace_id, "Indexing paper for smart search...", 60)
            try:
                from app.services.rag import index_workspace
                await index_workspace(workspace_id, user_id, content["text"])
            except Exception as rag_err:
                logger.error("RAG indexing failed — workspace %s — %s", workspace_id, str(rag_err))

        await _set_progress(db, workspace_id, "Building your presentation...", 65)

        workspace_dir = GENERATED_DIR / workspace_id
        workspace_dir.mkdir(parents=True, exist_ok=True)
        base_name = Path(workspace.get("originalName", "paper")).stem if "originalName" in workspace else "paper"

        pptx_bytes = generate_pptx(analysis)
        pptx_path = workspace_dir / f"{base_name}_15slide.pptx"
        pptx_path.write_bytes(pptx_bytes)

        await _set_progress(db, workspace_id, "Building your quick pitch deck...", 80)

        quick_bytes = generate_quick_pptx(analysis)
        quick_path = workspace_dir / f"{base_name}_5slide.pptx"
        quick_path.write_bytes(quick_bytes)

        await _set_progress(db, workspace_id, "Saving your workspace...", 90)

        workspace_doc = await db["workspaces"].find_one(
            {"_id": ObjectId(workspace_id)}, {"originalName": 1}
        )
        base_name = Path(workspace_doc.get("originalName", "paper")).stem

        await db["workspaces"].update_one(
            {"_id": ObjectId(workspace_id)},
            {
                "$set": {
                    "status": EWorkspaceStatus.COMPLETED,
                    "processingStep": "Your workspace is ready",
                    "processingPercent": 100,
                    "analysis": analysis,
                    "pageCount": content["pageCount"],
                    "wordCount": content["wordCount"],
                    "pptxPath": str(pptx_path),
                    "quickPptxPath": str(quick_path),
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        logger.info("PDF processed — workspace %s", workspace_id)

    except Exception as e:
        logger.error("PDF processing failed — workspace %s — %s", workspace_id, str(e))
        await db["workspaces"].update_one(
            {"_id": ObjectId(workspace_id)},
            {
                "$set": {
                    "status": EWorkspaceStatus.FAILED,
                    "processingStep": "Something went wrong. Please try again.",
                    "errorMessage": str(e),
                    "updatedAt": datetime.utcnow(),
                }
            },
        )


async def _set_research_progress(db, job_id: str, step: str, percent: int):
    from app.core.redis import cache_set
    await cache_set(
        f"research:progress:{job_id}",
        {"step": step, "percent": percent},
        ttl=600,
    )
    await db["research_jobs"].update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"processingStep": step, "processingPercent": percent, "updatedAt": datetime.utcnow()}},
    )


async def _generate_research(job_id: str, user_id: str, plan_tier: str):
    from app.core.database import connect_database, get_database
    from app.services.search_service import search_web
    from app.services.ai import router as ai_router
    from app.services.ai.prompts import RESEARCH_GENERATION_SYSTEM_PROMPT
    from app.services.generators.ppt_generator import generate_pptx, generate_quick_pptx
    from app.shared.constant.application import EResearchStatus

    await connect_database()
    db = get_database()

    await db["research_jobs"].update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": EResearchStatus.PROCESSING, "updatedAt": datetime.utcnow()}},
    )

    try:
        await _set_research_progress(db, job_id, "Searching the web...", 10)

        job = await db["research_jobs"].find_one({"_id": ObjectId(job_id)}, {"topic": 1})
        if not job:
            raise Exception("Research job not found")

        topic = job["topic"]

        await _set_research_progress(db, job_id, "Gathering sources...", 25)
        web_content = await search_web(topic)

        await _set_research_progress(db, job_id, "AI is synthesising sources...", 45)

        user_content = f"Research topic: {topic}\n\nSource texts from web search:\n\n{web_content}"
        analysis = await ai_router.generate(plan_tier, RESEARCH_GENERATION_SYSTEM_PROMPT, user_content)

        await _set_research_progress(db, job_id, "Building your presentation...", 70)

        job_dir = GENERATED_DIR / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        safe_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in topic[:50]).strip()

        pptx_bytes = generate_pptx(analysis)
        pptx_path = job_dir / f"{safe_name}_15slide.pptx"
        pptx_path.write_bytes(pptx_bytes)

        await _set_research_progress(db, job_id, "Building your quick pitch deck...", 85)

        quick_bytes = generate_quick_pptx(analysis)
        quick_path = job_dir / f"{safe_name}_5slide.pptx"
        quick_path.write_bytes(quick_bytes)

        await _set_research_progress(db, job_id, "Your research is ready", 90)

        await db["research_jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": EResearchStatus.COMPLETED,
                    "processingStep": "Your research is ready",
                    "processingPercent": 100,
                    "analysis": analysis,
                    "pptxPath": str(pptx_path),
                    "quickPptxPath": str(quick_path),
                    "updatedAt": datetime.utcnow(),
                }
            },
        )

        logger.info("Research generated — job %s", job_id)

    except Exception as e:
        logger.error("Research generation failed — job %s — %s", job_id, str(e))
        await db["research_jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": EResearchStatus.FAILED,
                    "processingStep": "Something went wrong. Please try again.",
                    "errorMessage": str(e),
                    "updatedAt": datetime.utcnow(),
                }
            },
        )
