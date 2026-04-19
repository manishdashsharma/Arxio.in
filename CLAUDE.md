# Arxio — Engineering & Product Context

> Ideology: Drishti — दृष्टि — Vision. Clarity. Insight.
> Domain: arxio.in
> Stack: Next.js 14 (client/landing page) + Vite + React (app/application) + Python FastAPI (server)
> You are acting as a senior engineer, systems architect, and product designer.
> Think in systems. Think in user journeys. Think in tradeoffs.

---

## How to Think About This Product

Arxio is not a summariser. It is not a chatbot. It is a **complete research workflow replacement**.

The magic moment is: student uploads a 50-page IEEE paper at 11 PM, downloads a perfect 15-slide presentation at 11:10 PM, sleeps confidently. That word-of-mouth loop is the entire growth engine.

Every technical decision must serve that magic moment. If a feature does not make the workflow faster, simpler, or more impressive — it does not belong in v1.

**As you build, ask three questions:**
1. Does this make the magic moment faster or better?
2. Does this break on mobile at 11 PM on a student's phone?
3. Is the user ever confused about what to do next?

---

## Monorepo Structure

```
arxio/
├── client/                        # Next.js 14 + TypeScript + Tailwind — landing page only (SSR, SEO)
├── app/                           # Vite + React + TypeScript + Tailwind — full application (dashboard, workspace, library, all auth screens)
├── server/                        # Python 3.12 + FastAPI + UV
├── docs/                          # PRD and planning docs
├── sessions/                      # Daily session context (YYYY-MM-DD.md) — gitignored
├── docker-compose.yml             # Local dev + production
└── CLAUDE.md                      # This file
```

---

## Session Files — Always Required

**First action in every session: read the latest session file, then create/update today's.**

```
sessions/YYYY-MM-DD.md
```

```md
# Session — YYYY-MM-DD

## Completed
- what was finished

## In Progress
- current task with file path

## Next
- next tasks in order

## Decisions Made
- any architectural or product decisions

## Blockers
- anything stuck
```

This exists to preserve context across sessions cheaply. Never re-derive what the session file already knows.

---

## Response Contract — Every API Endpoint

This is the single API response shape. No exceptions. Never deviate.

```python
# Success — single object
{"success": True, "message": "Workspace created", "data": {"workspace": {...}}}

# Success — list with pagination
{
  "success": True,
  "message": "Library fetched",
  "data": {
    "items": [...],
    "pagination": {"total": 100, "page": 1, "limit": 20, "hasNextPage": True}
  }
}

# Error
{"success": False, "message": "PDF not found", "data": None}
```

Central helper lives at `server/app/core/response.py`:

```python
from app.core.response import success_response, error_response, paginated_response
```

Frontend TypeScript contract:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

interface PaginatedData<T> {
  items: T[];
  pagination: { total: number; page: number; limit: number; hasNextPage: boolean };
}
```

---

## Backend Architecture — Python / FastAPI

### Why This Stack

FastAPI is async-native and Python's ecosystem owns PDF processing, AI client SDKs, and document generation. The AI pipeline (PyMuPDF → Groq/Claude → python-pptx/docx) is a first-class Python story. Do not fight it.

Motor (async MongoDB driver) keeps the entire request path non-blocking. Celery handles the long-running AI jobs so the HTTP response returns immediately and the user sees live progress.

### Folder Structure

```
server/
├── pyproject.toml                 # uv managed
├── main.py                        # App factory — register routers, middleware, lifespan
├── app/
│   ├── routers/
│   │   ├── auth.py                # POST /auth/signup, /auth/login, /auth/refresh
│   │   ├── pdf.py                 # POST /pdf/upload, /pdf/generate, GET /pdf/:id
│   │   ├── research.py            # POST /research/generate, GET /research/:id
│   │   ├── chat.py                # POST /chat/message, GET /chat/:workspaceId/history
│   │   ├── library.py             # GET /library, POST /library/search, /library/folder
│   │   ├── export.py              # GET /export/:id/:format (triggers file gen)
│   │   └── webhooks.py            # POST /webhooks/stripe
│   ├── services/
│   │   ├── ai/
│   │   │   ├── groq_client.py     # Llama 3.3 70B — Free / Student plans
│   │   │   ├── openai_client.py   # GPT-4o — Pro / Scholar plans
│   │   │   └── router.py          # Route to correct client based on user plan
│   │   ├── pdf_processor.py       # PyMuPDF + pdfplumber — text, tables, equations
│   │   ├── search.py              # Tavily (web) + NewsAPI
│   │   ├── academic.py            # Semantic Scholar API
│   │   ├── rag.py                 # Qdrant embed + query (Scholar only)
│   │   ├── stripe_service.py      # Subscription create/cancel/upgrade
│   │   └── generators/
│   │       ├── ppt_generator.py   # python-pptx — 15-slide and 5-slide templates
│   │       ├── docx_generator.py  # python-docx
│   │       ├── pdf_generator.py   # WeasyPrint
│   │       └── excel_generator.py # openpyxl
│   ├── models/                    # Motor document models (Beanie)
│   │   ├── user.py
│   │   ├── workspace.py           # PDF workspaces
│   │   ├── research_job.py        # Research mode jobs
│   │   ├── generated_file.py      # All generated files metadata + R2 keys
│   │   ├── chat_message.py
│   │   └── subscription.py
│   ├── schemas/                   # Pydantic v2 request / response models
│   │   ├── auth.py
│   │   ├── pdf.py
│   │   ├── research.py
│   │   ├── chat.py
│   │   └── library.py
│   ├── workers/
│   │   ├── celery_app.py          # Celery + Redis broker config
│   │   └── tasks.py               # process_pdf_task, generate_research_task
│   ├── middleware/
│   │   ├── auth.py                # JWT bearer — get_current_user dependency
│   │   └── plan_guard.py          # Feature gate by plan tier
│   └── core/
│       ├── config.py              # Pydantic Settings — typed env vars, single source of truth
│       ├── database.py            # Motor async client — singleton with lifespan
│       ├── storage.py             # Cloudflare R2 via boto3 — upload, signed URL, delete
│       ├── security.py            # JWT encode / decode / hash
│       ├── redis.py               # Redis client + cache/session helpers
│       └── response.py            # Response shape helpers
└── Dockerfile
```

### Router Pattern

```python
from fastapi import APIRouter, Depends, UploadFile, File
from app.middleware.auth import get_current_user
from app.core.response import success_response, error_response

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
) -> dict:
    try:
        result = await upload_pdf_service(current_user["id"], file)
        return success_response("PDF uploaded", result)
    except Exception as e:
        return error_response(str(e), status_code=getattr(e, "status_code", 500))
```

### Service Pattern

```python
async def upload_pdf_service(user_id: str, file: UploadFile) -> dict:
    if file.content_type != "application/pdf":
        err = Exception("Only PDF files are accepted")
        err.status_code = 400
        raise err

    file_key = await storage.upload(file, f"pdfs/{user_id}/")
    workspace = await WorkspaceModel(userId=user_id, fileKey=file_key).insert()
    return {"workspaceId": str(workspace.id), "fileKey": file_key}
```

### MongoDB Patterns

```python
from app.core.database import get_database

async def get_workspace(workspace_id: str, user_id: str) -> dict:
    db = await get_database()
    doc = await db["workspaces"].find_one(
        {"_id": ObjectId(workspace_id), "userId": user_id, "isActive": True},
        {"title": 1, "status": 1, "outputs": 1, "createdAt": 1}
    )
    if not doc:
        err = Exception("Workspace not found")
        err.status_code = 404
        raise err
    return doc
```

- Always project fields — never fetch full document
- Always filter `isActive: True`
- Parallel independent queries: `asyncio.gather`
- No query inside a loop — use `$in` or aggregation
- Paginated: `count_documents` + `find` in `asyncio.gather`

### MongoDB Model Requirements

Every model must have:

```python
class WorkspaceModel(Document):
    userId: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "workspaces"
        indexes = [
            IndexModel([("userId", 1), ("isActive", 1)]),
        ]
```

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Service functions | `<verb>_<resource>_service` | `create_workspace_service` |
| Router files | `<resource>.py` | `pdf.py`, `research.py` |
| Pydantic schemas | `<Verb><Resource>Request/Response` | `UploadPDFRequest` |
| Enums | `E` prefix | `EPlanTier`, `EWorkspaceStatus` |
| File names | `<name>_<type>.py` | `ppt_generator.py`, `groq_client.py` |

### Redis Helpers

```python
from app.core.redis import cache_set, cache_get, cache_del

await cache_set(f"workspace:{workspace_id}", data, ttl=3600)
cached = await cache_get(f"workspace:{workspace_id}")
await cache_del(f"workspace:{workspace_id}")
```

- Always TTL — never store without expiry
- Key pattern: `<resource>:<id>` or `<resource>:<userId>:<scope>`
- Invalidate on any write
- Redis errors are non-fatal — catch, log, fall back to DB

### Celery Background Jobs

PDF processing takes 2-4 minutes. Never block an HTTP request for it.

```python
from app.workers.tasks import process_pdf_task

task = process_pdf_task.delay(workspace_id, user_id, plan_tier)
return success_response("Processing started", {"taskId": task.id, "workspaceId": workspace_id})
```

Progress updates go to Redis pub/sub. Frontend polls `GET /pdf/:id/status` or uses SSE.

---

## Frontend Architecture — Next.js 14

### Why This Stack

Next.js 14 App Router gives SSR for SEO on the landing page, client components for the interactive workspace, and route groups for clean auth separation. Tailwind keeps dark mode consistent across the entire product.

### Folder Structure

```
client/
├── app/
│   ├── (auth)/                    # Public — no auth required
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/               # Protected — layout wraps all
│   │   ├── layout.tsx             # Auth check + sidebar shell
│   │   ├── dashboard/page.tsx     # Home after login
│   │   ├── workspace/[id]/page.tsx
│   │   ├── research/page.tsx
│   │   └── library/page.tsx
│   ├── globals.css
│   ├── layout.tsx                 # Root — fonts, theme provider
│   └── page.tsx                   # Landing page (SSR, SEO)
├── components/
│   ├── ui/                        # Button, Card, Input, Modal, Badge, Spinner
│   ├── upload/
│   │   ├── DropZone.tsx           # PDF drag-and-drop
│   │   └── ProcessingScreen.tsx   # Live status messages + progress bar
│   ├── workspace/
│   │   ├── WorkspaceSidebar.tsx   # Output list — Cheat Sheet, PPT, Q&A...
│   │   ├── OutputPreview.tsx      # 70% preview pane
│   │   └── WorkspaceHeader.tsx    # Share + Download All
│   ├── chat/
│   │   ├── ChatPanel.tsx          # Full chat UI
│   │   └── ChatMessage.tsx        # Individual message bubble
│   ├── library/
│   │   ├── LibraryGrid.tsx        # Paper cards grid
│   │   └── LibrarySearch.tsx      # Search across everything
│   ├── presentation/
│   │   └── PresentationMode.tsx   # Full-screen slide viewer
│   └── shared/
│       ├── Navbar.tsx
│       ├── PlanGateBanner.tsx     # "This is a Pro feature" nudges
│       └── PageLoader.tsx
├── lib/
│   ├── api.ts                     # Typed API client — all fetch calls here
│   ├── auth.ts                    # NextAuth config
│   └── utils.ts                   # cn(), formatDate(), truncate()
├── hooks/
│   ├── useWorkspace.ts
│   ├── useChat.ts
│   ├── useLibrary.ts
│   └── useProcessingStatus.ts     # Polls /pdf/:id/status during generation
├── types/
│   ├── workspace.ts
│   ├── user.ts
│   └── api.ts
└── public/
    └── templates/                 # PPT template thumbnail previews
```

### Design Rules (Product Designer Lens)

- **One action per screen** — user never wonders what to do next
- **Progress always visible** — live status messages during generation, never a blank wait
- **Dark mode from day one** — students work at night; light mode is secondary
- **Mobile first** — design for 390px width, then scale up
- **No popups for upsell** — contextual nudges only at the moment of friction
- **Delight in details** — subtle animations on upload success, workspace ready state

```typescript
const PLAN_NUDGES = {
  ppt_locked:       "PPT export is available on Student plan and above",
  history_expired:  "Upgrade to Student to keep your library forever",
  pdf_limit:        "You have used your 3 free PDFs this month",
  comparison_locked:"Paper comparison is a Pro feature",
  academic_locked:  "Academic mode with real citations is on Scholar plan",
};
```

---

## AI Routing by Plan

```python
class EPlanTier(str, Enum):
    FREE = "free"
    STUDENT = "student"
    PRO = "pro"
    SCHOLAR = "scholar"

AI_ROUTING = {
    EPlanTier.FREE:    "groq",
    EPlanTier.STUDENT: "groq",
    EPlanTier.PRO:     "openai",
    EPlanTier.SCHOLAR: "openai",
}
```

### AI Output Contract

All generation returns structured JSON — backend renders it into files. Never have AI return raw prose directly into documents.

```json
{
  "paperTitle": "...",
  "authors": ["..."],
  "year": 2024,
  "overview": "...",
  "keyTerms": [{"term": "...", "definition": "...", "analogy": "..."}],
  "methodology": {"summary": "...", "steps": ["..."]},
  "results": {"summary": "...", "keyFindings": ["..."]},
  "criticalAnalysis": {"strengths": ["..."], "weaknesses": ["..."]},
  "slides": [{"title": "...", "bullets": ["..."], "speakerNote": "..."}],
  "qaPrep": [{"question": "...", "answer": "..."}],
  "cheatSheet": {"keyTerms": [...], "topResults": [...], "talkingPoints": [...]}
}
```

---

## Feature Gating

```python
PLAN_LIMITS = {
    "free":    {"pdfs_per_month": 3,  "research_per_month": 5,   "chat_messages": 10,  "ppt": False, "rag": False, "academic_mode": False, "history_days": 7},
    "student": {"pdfs_per_month": 20, "research_per_month": 30,  "chat_messages": 50,  "ppt": True,  "rag": False, "academic_mode": False, "history_days": 180},
    "pro":     {"pdfs_per_month": 60, "research_per_month": 100, "chat_messages": -1,  "ppt": True,  "rag": False, "academic_mode": False, "history_days": -1},
    "scholar": {"pdfs_per_month": -1, "research_per_month": -1,  "chat_messages": -1,  "ppt": True,  "rag": True,  "academic_mode": True,  "history_days": -1},
}
```

Gate at `plan_guard.py` middleware — never check limits inside business logic.

---

## File Generation Pipeline

| Format | Library | Generator | Output |
|---|---|---|---|
| `.pptx` | python-pptx | `ppt_generator.py` | 15-slide or 5-slide deck |
| `.docx` | python-docx | `docx_generator.py` | Full report with headings |
| `.pdf` | WeasyPrint | `pdf_generator.py` | Print-ready PDF |
| `.xlsx` | openpyxl | `excel_generator.py` | Data tables + charts |
| `.zip` | stdlib zipfile | inline in `export.py` | Full bundle of all above |

Flow: AI JSON → generator → bytes → upload to Cloudflare R2 → return signed URL. User never waits for a file download to generate synchronously.

---

## Infrastructure

```
Hostinger VPS (KVM 2, 8GB RAM) — Ubuntu + Docker + Nginx
├── nginx (reverse proxy + SSL)
├── next-app (client container, port 3000)
├── fastapi-app (server container, port 8000)
├── celery-worker (background jobs)
├── redis (broker + cache)
└── mongodb (local dev — Atlas in prod)

Cloudflare R2  — uploaded PDFs + generated files
Qdrant Cloud   — vector embeddings (Scholar RAG)
MongoDB Atlas  — production database
Stripe         — subscriptions
```

---

## Environment Variables

```env
GROQ_API_KEY=
ANTHROPIC_API_KEY=
TAVILY_API_KEY=
NEWS_API_KEY=
MONGODB_URI=
REDIS_URL=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=
QDRANT_URL=
QDRANT_API_KEY=
JWT_SECRET=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=https://arxio.in
ENVIRONMENT=development
```

---

## Hard Rules — No Exceptions

### Code Quality
- Zero comments, zero JSDoc, zero docstrings — naming makes code readable
- Zero `console.log` or `print()` statements
- Type hints on every Python function signature and return type
- No raw `MongoClient()`, `Redis()`, `boto3.client()` — always use core helpers
- No blocking I/O in FastAPI routes — everything `async`

### Data
- No hard deletes — always `isActive = False`
- Always filter `isActive: True` in every query
- Always project only needed fields — never `SELECT *` equivalent
- No query inside a loop — use `$in`, aggregation, or bulk fetch

### Routes
- FastAPI: GET reads, POST writes — no PUT/PATCH/DELETE
- Auth chain: `get_current_user` → `plan_guard` → handler → service
- Every endpoint returns `{success, message, data}`
- Next.js: all API calls go through `lib/api.ts` — never fetch directly in components

### Architecture
- Long AI jobs → Celery, not HTTP response
- Cache reads, invalidate on writes
- Redis errors never crash the app — always fall back to DB
- Generated files go to R2, never served from app server

---

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: auth, boilerplate, DB connections, Docker | Not started |
| 2 | PDF Mode MVP: upload → extract → AI → Word/PDF download | Not started |
| 3 | Presentations: PPT generation + in-browser presentation mode | Not started |
| 4 | Research Mode: Tavily + multi-format output | Not started |
| 5 | Chat: per-workspace chat with context, plan limits | Not started |
| 6 | Library: search, folders, tags, mobile polish | Not started |
| 7 | Payments: Stripe plans, usage tracking, upgrade nudges | Not started |
| 8 | RAG + Scholar: Qdrant, academic mode, API access | Not started |
| 9 | Launch: Product Hunt, communities, referral | Not started |

---

*Arxio — arxio.in | Drishti — दृष्टि*
*Senior Engineer + Architect + Product Designer lens. Always.*
