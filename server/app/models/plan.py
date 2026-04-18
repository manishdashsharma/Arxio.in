from app.core.database import get_database

COLLECTION = "plans"

PLAN_SEEDS = [
    {
        "tier": "free",
        "name": "Free",
        "tagline": "Try it tonight",
        "price": 0,
        "currency": "USD",
        "billing": "monthly",
        "highlight": False,
        "features": [
            "3 PDFs per month",
            "5 research topics per month",
            "10 chat messages per month",
            "In-app workspace viewer",
            "7-day history",
        ],
        "limits": {
            "pdfs_per_month": 3,
            "research_per_month": 5,
            "chat_messages": 10,
            "ppt": False,
            "rag": False,
            "academic_mode": False,
            "history_days": 7,
            "presentation_mode": False,
            "share_links": False,
            "comparison": False,
            "priority_ai": False,
        },
    },
    {
        "tier": "student",
        "name": "Student",
        "tagline": "For students who take presentations seriously",
        "price": 9,
        "currency": "USD",
        "billing": "monthly",
        "highlight": True,
        "features": [
            "20 PDFs per month",
            "30 research topics per month",
            "50 chat messages per month",
            "PPT export — 15-slide & 5-slide decks",
            "In-browser presentation mode",
            "Share workspace links",
            "180-day history",
        ],
        "limits": {
            "pdfs_per_month": 20,
            "research_per_month": 30,
            "chat_messages": 50,
            "ppt": True,
            "rag": False,
            "academic_mode": False,
            "history_days": 180,
            "presentation_mode": True,
            "share_links": True,
            "comparison": False,
            "priority_ai": False,
        },
    },
    {
        "tier": "pro",
        "name": "Pro",
        "tagline": "For researchers who need more, faster",
        "price": 19,
        "currency": "USD",
        "billing": "monthly",
        "highlight": False,
        "features": [
            "60 PDFs per month",
            "100 research topics per month",
            "Unlimited chat messages",
            "PPT export — 15-slide & 5-slide decks",
            "In-browser presentation mode",
            "Share workspace links",
            "Paper comparison mode",
            "GPT-4o — full model",
            "Forever history",
        ],
        "limits": {
            "pdfs_per_month": 60,
            "research_per_month": 100,
            "chat_messages": -1,
            "ppt": True,
            "rag": False,
            "academic_mode": False,
            "history_days": -1,
            "presentation_mode": True,
            "share_links": True,
            "comparison": True,
            "priority_ai": True,
        },
    },
    {
        "tier": "scholar",
        "name": "Scholar",
        "tagline": "Unlimited. Smarter. Built for serious academics",
        "price": 39,
        "currency": "USD",
        "billing": "monthly",
        "highlight": False,
        "features": [
            "Unlimited PDFs",
            "Unlimited research topics",
            "Unlimited chat messages",
            "PPT export — 15-slide & 5-slide decks",
            "In-browser presentation mode",
            "Share workspace links",
            "Paper comparison mode",
            "GPT-4o — full model",
            "RAG — smart semantic search across your paper",
            "Forever history",
        ],
        "limits": {
            "pdfs_per_month": -1,
            "research_per_month": -1,
            "chat_messages": -1,
            "ppt": True,
            "rag": True,
            "academic_mode": True,
            "history_days": -1,
            "presentation_mode": True,
            "share_links": True,
            "comparison": True,
            "priority_ai": True,
        },
    },
]


async def seed_plans() -> None:
    from app.core.logger import logger
    db = get_database()
    await db[COLLECTION].create_index("tier", unique=True)

    for plan in PLAN_SEEDS:
        await db[COLLECTION].update_one(
            {"tier": plan["tier"]},
            {"$set": plan},
            upsert=True,
        )

    logger.info("Plans seeded — %d plans", len(PLAN_SEEDS))


async def get_plan_limits(tier: str) -> dict:
    from app.core.redis import cache_get, cache_set

    cache_key = f"plan:limits:{tier}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    db = get_database()
    plan = await db[COLLECTION].find_one({"tier": tier}, {"limits": 1, "_id": 0})
    if not plan:
        return {}

    await cache_set(cache_key, plan["limits"], ttl=3600)
    return plan["limits"]


async def get_all_plans() -> list:
    from app.core.redis import cache_get, cache_set

    cached = await cache_get("plans:all")
    if cached:
        return cached

    db = get_database()
    plans = await db[COLLECTION].find(
        {},
        {"_id": 0, "tier": 1, "name": 1, "tagline": 1, "price": 1, "currency": 1, "billing": 1, "highlight": 1, "features": 1, "limits": 1},
    ).sort("price", 1).to_list(10)

    await cache_set("plans:all", plans, ttl=3600)
    return plans
