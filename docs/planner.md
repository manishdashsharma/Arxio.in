# Arxio — Complete Product Build Plan

> You are the senior engineer, architect, product designer, and product owner.
> One standard: the best research tool in the market. Not an MVP. A product.
> North star: student uploads paper at 11 PM, walks into presentation at 9 AM fully prepared.

---

## The Standard We Build To

Before writing a single line of code, internalize this:

- Every generated PPT must be directly presentable — zero manual editing needed
- Every AI output must be accurate, structured, and complete
- Every loading state must show progress — user never wonders "is it working?"
- Every error must tell the user exactly what happened and what to do
- Every endpoint must be sub-200ms for reads, background for anything over 2 seconds
- Mobile must work perfectly — students use phones at 11 PM
- Dark mode is the default — not an afterthought

If a feature doesn't meet this standard, it doesn't ship.

---

## Current State — Phase 1 Complete

**What's built:**
- FastAPI app, MongoDB Atlas, Redis, Cloudflare R2 wired
- Full auth — signup, login, OTP email verify, forgot password, logout, me
- Plans seeded (free/student/pro/scholar), plan guard middleware
- AI stack: Groq (Free/Student) + OpenAI GPT-4o (Pro/Scholar)

**What's not built yet:** Everything that makes Arxio, Arxio.

---

## The Build Order — Why This Sequence

```
AI Foundation (prompts + clients)
        ↓
PDF Pipeline (upload → extract → generate → export)
        ↓
File Generators (PPT + DOCX + PDF)
        ↓
Frontend — PDF Workspace
        ↓
Chat
        ↓
Research Mode
        ↓
Library
        ↓
Frontend — Full Product
        ↓
Payments
        ↓
RAG + Scholar
        ↓
Launch
```

Backend and frontend are interleaved — we build a backend module, then its frontend immediately. Never build 6 backend modules then all frontend. That produces broken products.

---

## Phase 2 — The AI Engine

> Everything Arxio does flows through here. Get this wrong and nothing works.

### 2.1 — System Prompts
**File:** `server/app/services/ai/prompts.py`

Not one prompt. Seven prompts. Each tuned for its specific output.

```
PDF_ANALYSIS_SYSTEM_PROMPT       → Full paper analysis → structured JSON
PDF_OVERVIEW_PROMPT              → Plain English paper summary
PDF_SLIDES_PROMPT                → 15 slides with speaker notes
PDF_QA_PREP_PROMPT               → 10 professor questions + perfect answers
PDF_CHEAT_SHEET_PROMPT           → One-page reference card
PDF_CRITICAL_ANALYSIS_PROMPT     → Real strengths, real weaknesses
CHAT_WITH_PAPER_PROMPT           → Context-aware conversation
RESEARCH_GENERATION_PROMPT       → Topic → document with citations
```

Every prompt must:
- Instruct the AI to return ONLY valid JSON — no prose before or after
- Define the exact output schema with field names and types
- Include a fallback instruction if a section is not found in the paper
- Be tested against 5 real IEEE/ACM papers before we move forward

### 2.2 — AI Clients
**Files:**
- `server/app/services/ai/groq_client.py`
- `server/app/services/ai/openai_client.py`
- `server/app/services/ai/router.py`

Both expose the same async interface:
```python
async def generate(system_prompt: str, user_content: str, response_format: str = "json") -> dict
```

Router picks by plan. Callers never know which AI ran.

Error handling: if AI returns malformed JSON → retry once → if still fails → structured error, never crash.

**Quality gate:** Run both clients against the same paper. Output must be valid JSON matching the schema. Do not proceed to generators until this passes.

---

## Phase 3 — PDF Pipeline

### 3.1 — Workspace Model
**File:** `server/app/models/workspace.py`

The central document for everything PDF-related.

```python
{
  "userId": "",
  "originalFileName": "",
  "fileSize": 0,
  "fileKey": "",           # R2 path to original PDF
  "status": "pending",     # pending → extracting → generating → ready | failed
  "processingStep": "",    # "Reading paper..." shown to frontend
  "taskId": "",            # Celery task ID
  "extractedText": "",     # Raw text from PyMuPDF (cleared after generation to save storage)
  "aiOutput": {},          # Full parsed JSON from AI — source of truth
  "outputs": {             # R2 keys per generated file
    "overview":   { "pdf": "", "docx": "" },
    "concepts":   { "pdf": "", "docx": "" },
    "methodology":{ "pdf": "", "docx": "" },
    "results":    { "pdf": "", "docx": "" },
    "analysis":   { "pdf": "", "docx": "" },
    "slides":     { "pptx": "" },
    "quickSlides":{ "pptx": "" },
    "script":     { "pdf": "", "docx": "" },
    "qaPrep":     { "pdf": "", "docx": "" },
    "cheatSheet": { "pdf": "" },
    "bundle":     { "zip": "" }
  },
  "processingError": "",
  "isActive": True,
  "createdAt": "",
  "updatedAt": ""
}
```

Index: `[userId, isActive, createdAt]`

### 3.2 — PDF Upload
**Route:** `POST /pdf/upload`
**Guard:** `require_usage("pdfs_per_month")`

1. Validate — PDF only, max 50MB
2. Upload to R2 at `pdfs/{userId}/{uuid4}.pdf`
3. Create workspace doc — status: `pending`
4. Increment `pdfs_used_this_month` on user
5. Return `{ workspaceId, status }`

Upload and process are separate. Upload is instant. Processing is background.

### 3.3 — PDF Extraction
**File:** `server/app/services/pdf_processor.py`
**Deps:** `pymupdf`, `pdfplumber`

Not just raw text dump. Intelligent extraction:

1. PyMuPDF → full text per page
2. pdfplumber → tables as structured markdown
3. Detect sections: Abstract, Introduction, Related Work, Methodology, Results, Discussion, Conclusion, References
4. Preserve section headers in extracted text
5. Clean: remove headers/footers, page numbers, citation numbers `[1]`
6. Return structured dict: `{ "sections": { "abstract": "", "methodology": "" }, "tables": [], "fullText": "" }`

Why sections matter: The AI prompt can say "look at the methodology section" instead of scanning 50 pages. Faster, cheaper, more accurate.

### 3.4 — Celery Workers
**Files:**
- `server/app/workers/celery_app.py`
- `server/app/workers/tasks.py`

`process_pdf_task(workspace_id, user_id, plan)`:

```
Step 1 — status: extracting  → "Reading your paper..."
Step 2 — Download PDF from R2
Step 3 — PyMuPDF extraction
Step 4 — status: generating  → "Analysing methodology..."
Step 5 — AI call → structured JSON
Step 6 — status: generating  → "Building your presentation..."
Step 7 — PPT generator → R2
Step 8 — status: generating  → "Writing your documents..."
Step 9 — DOCX + PDF generators → R2
Step 10 — status: generating → "Creating your cheat sheet..."
Step 11 — Cheat sheet generator → R2
Step 12 — Bundle zip → R2
Step 13 — status: ready      → "Your workspace is ready"
Step 14 — Clear extractedText from workspace (save storage)
```

Each step writes progress to Redis:
```python
await cache_set(f"workspace:progress:{workspace_id}", {
    "status": "generating",
    "step": "Building your presentation...",
    "percent": 60
}, ttl=600)
```

On any exception: status → `failed`, error stored, user notified.

### 3.5 — Process + Status Routes
```
POST /pdf/:id/process      → triggers Celery task
GET  /pdf/:id/status       → returns { status, step, percent } from Redis
GET  /pdf/:id              → full workspace + signed download URLs
GET  /pdf                  → paginated list of user's workspaces
```

`GET /pdf/:id` returns signed URLs (1hr) for every output in `outputs`. Frontend uses these directly. Never proxy files through the app server.

---

## Phase 4 — File Generators

> This is where the product quality is visible. These files are what the user hands to their professor.

### 4.1 — PPT Generator
**File:** `server/app/services/generators/ppt_generator.py`
**Dep:** `python-pptx`

15-slide deck structure:
```
Slide 1  — Title (paper title, authors, year, presented by)
Slide 2  — Agenda (what we'll cover)
Slide 3  — Overview (what this paper is about, in 3 bullets)
Slide 4  — Problem Statement (what problem does it solve)
Slide 5  — Key Concepts (3-4 terms with simple definitions)
Slide 6  — Methodology (how they did it — step by step)
Slide 7  — Architecture / System Design (if applicable)
Slide 8  — Key Results (numbers, findings)
Slide 9  — Results Visualised (table or comparison)
Slide 10 — Critical Analysis (strengths)
Slide 11 — Critical Analysis (weaknesses + open questions)
Slide 12 — Literature Connections (how it fits the field)
Slide 13 — What I Learned (personalised insight)
Slide 14 — Q&A Prep (top 3 questions + short answers)
Slide 15 — References
```

Design rules:
- Dark background (#0F0F0F), white text
- Accent color: electric blue (#2D6EF7)
- One key point per slide — never more than 4 bullets
- Speaker notes on every slide (from `speakerNote` in AI output)
- University logo placeholder on title slide

Also build 5-slide "Quick Pitch" version:
```
Slide 1 — Title
Slide 2 — What + Why
Slide 3 — How (methodology in 3 steps)
Slide 4 — Results + Impact
Slide 5 — Key Takeaway
```

### 4.2 — DOCX Generator
**File:** `server/app/services/generators/docx_generator.py`
**Dep:** `python-docx`

For each output type (overview, methodology, results, critical analysis):
- Proper heading hierarchy (H1, H2, H3)
- Table of contents
- Professional typography (Calibri, consistent spacing)
- Page numbers, header with paper title

### 4.3 — PDF Generator
**File:** `server/app/services/generators/pdf_generator.py`
**Dep:** `weasyprint`

HTML → PDF. Clean, print-ready. Used for cheat sheet especially.

Cheat sheet layout:
- A4 landscape, two columns
- Box 1: Key Terms (term + one-line definition)
- Box 2: Key Results (bullet numbers)
- Box 3: Methodology steps
- Box 4: Talking points for Q&A
- Designed to be printed and held during presentation

**Quality gate:** Generated PPT must be openable in PowerPoint and Google Slides without errors. DOCX must open in Word and Google Docs. PDF must be print-ready.

---

## Phase 5 — Frontend: PDF Workspace

> First frontend phase. Build this immediately after generators work.

### Screens to build:

**Landing Page** (`/`)
- Hero: "Your personal research brain"
- Two CTAs: Upload PDF | Research a Topic
- 3 use case stories (not testimonials — stories)
- Pricing summary
- SSR for SEO

**Upload Flow** (`/dashboard`)
- Large drag-and-drop zone
- File validation with clear error messages
- Animated confirmation on drop
- Single "Generate Workspace" button
- Processing screen: live status messages + real progress bar + estimated time

**Workspace** (`/workspace/[id]`)
- Left sidebar (30%): output list with icons
- Right preview (70%): renders selected output inline
- Header: paper title + Share + Download All buttons
- Chat bar pinned to bottom
- Present button top-right → launches presentation mode
- Every output has Preview + Download buttons
- Signed URL fetch on demand (not on page load)

**Presentation Mode** (full-screen overlay)
- Slide-by-slide navigation
- Speaker notes visible to presenter
- Q&A cards accessible on side panel
- Keyboard navigation (arrow keys)
- Exit back to workspace

### Frontend Quality Standard:
- Dark mode default, uses `next-themes`
- Every async action has a loading state
- Every error has a human-readable message
- Framer Motion for workspace transitions
- Mobile: workspace sidebar collapses to bottom sheet

---

## Phase 6 — Chat

**Backend:**
- `server/app/models/chat_message.py` — collection per workspace
- `server/app/routers/chat.py` — `POST /chat/message`, `GET /chat/:workspaceId/history`
- `server/app/services/chat_service.py`

Chat context = system prompt with full `aiOutput` JSON from workspace. AI knows the entire paper. User asks anything.

Conversation memory: last 10 messages included in every call.

Plan limits via `require_usage("chat_messages")`.

**Frontend:**
- ChatPanel component in workspace sidebar
- Message bubbles with markdown rendering
- Typing indicator during AI response
- Suggested questions on first open: "What will my professor ask?", "Explain [key term] simply", "Write my opening line"

---

## Phase 7 — Research Mode

**Backend:**
- `server/app/services/search.py` — Tavily API
- `server/app/services/academic.py` — Semantic Scholar
- `server/app/models/research_job.py`
- `server/app/routers/research.py`
- Celery task: `process_research_task`

Research depths at launch:
- `quick` — 5 Tavily results (~30s) — all plans
- `deep` — 15 sources + full scraping (~2min) — Pro+
- `academic` — Semantic Scholar + Tavily (~3min) — Scholar only

Output formats: PPT, DOCX, PDF, Research Report. Excel in v1.1.

**Frontend:**
- Research input page with depth + format selectors
- Same processing screen as PDF mode (reuse component)
- Result lands in library, opens same workspace UI

---

## Phase 8 — Library

**Backend:**
- `server/app/routers/library.py` — `GET /library`, `POST /library/search`
- `server/app/models/folder.py`
- History cutoff enforced at query time by plan limits

Library = workspaces + research jobs merged, sorted by recency.

MongoDB text index on `originalFileName` + `aiOutput.paperTitle` + `aiOutput.overview`.

**Frontend:**
- Grid of cards (paper title, date, outputs available)
- Search bar — searches across everything
- Folder system — create, rename, move items
- Each card: Open | Download All | Delete (soft)

---

## Phase 9 — Payments

**Backend:**
- `server/app/services/stripe_service.py`
- `server/app/routers/webhooks.py`
- Stripe events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

Plan upgrade flow:
1. User hits feature gate → contextual nudge shown
2. Clicks upgrade → `POST /payments/checkout` → Stripe Checkout URL
3. User pays → Stripe webhook fires
4. Webhook updates user: `plan`, `is_subscribed: true`, `subscription: { ... }`
5. Redis plan cache invalidated instantly
6. User's next request has new limits

Downgrade / cancellation:
- Set `cancel_at_period_end: true`
- On `customer.subscription.deleted` → downgrade to free, clear subscription

**Frontend:**
- Pricing page (`/pricing`)
- Upgrade modal triggered at feature gates — contextual, not a popup
- Plan gate banners: "PPT export is available on Student plan and above"
- Billing page in dashboard: current plan, next renewal, cancel option

---

## Phase 10 — RAG + Scholar

**Backend:**
- `server/app/services/rag.py` — Qdrant embed + query
- Extended chat for cross-library queries

On PDF upload for Scholar users: embed extracted text → store in Qdrant with `{ userId, workspaceId }` metadata.

Cross-library chat: embed query → Qdrant search → retrieve top chunks → AI answers with source citations.

**Quality gate:** Must correctly identify which papers discuss a given concept across a 10-paper library.

---

## Phase 11 — Launch Preparation

**Infrastructure:**
- `server/Dockerfile` + `client/Dockerfile`
- `docker-compose.yml` — all 5 services (nginx, client, server, worker, redis)
- `nginx/nginx.conf` — reverse proxy + SSL termination
- GitHub Actions CI — lint + test on every push
- Health check endpoints for all services
- Sentry error tracking wired on both frontend and backend
- MongoDB Atlas — production cluster with backups enabled
- Cloudflare R2 — production bucket, CORS configured

**Before launch checklist:**
- [ ] All 4 plan tiers tested end-to-end
- [ ] PPT opens in PowerPoint, Google Slides, Keynote
- [ ] DOCX opens in Word, Google Docs
- [ ] Email delivery confirmed (Resend production domain)
- [ ] Stripe test mode → live mode switch
- [ ] Mobile tested on iPhone SE (smallest common screen)
- [ ] Load test: 10 concurrent PDF processing jobs
- [ ] Error states tested: bad PDF, AI timeout, R2 upload fail
- [ ] All plan gates tested: free user can't access Pro features
- [ ] GDPR: privacy policy, data deletion endpoint

---

## Session Workflow — How We Work

Every session:
1. Read latest session file in `sessions/`
2. Work on the next item in the plan
3. Update session file when done
4. Update this planner when a phase completes

Every feature:
1. Backend first — model, service, router, tested with curl
2. Frontend immediately after — don't batch frontend work
3. Test the full user flow before moving to next feature

Code standard (non-negotiable):
- Zero comments
- Zero print() / console.log()
- Every Python function has type hints
- Every async operation is actually async
- Every error has a status code and human message

---

## The Phases — Summary

| Phase | What | Blocker For |
|---|---|---|
| 1 | Foundation + Auth | Everything |
| 2 | AI Engine (prompts + clients) | PDF pipeline |
| 3 | PDF Pipeline (upload → extract → generate) | File generators |
| 4 | File Generators (PPT + DOCX + PDF) | Frontend workspace |
| 5 | Frontend: PDF Workspace | Chat, Research |
| 6 | Chat | Library |
| 7 | Research Mode | Library |
| 8 | Library | Payments |
| 9 | Payments | Scholar |
| 10 | RAG + Scholar | Launch |
| 11 | Launch Prep | — |

**Phase 1 is done. Start Phase 2 now.**

---

*Last updated: 2026-04-17*
*Current phase: 2 — AI Engine*
*Next action: `server/app/services/ai/prompts.py`*
