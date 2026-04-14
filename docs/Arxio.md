# Arxio — Product Requirements Document

> **Ideology:** Drishti — दृष्टि — Vision. Clarity. Insight.  
> **Domain:** arxio.in  
> **Version:** 1.0  
> **Date:** April 2026  
> **Status:** Active

---

## Table of Contents

1. [What is Arxio](#1-what-is-arxio)
2. [The Problem](#2-the-problem)
3. [The Vision](#3-the-vision)
4. [Target Users](#4-target-users)
5. [Core Features](#5-core-features)
   - [5.1 PDF Mode](#51-pdf-mode--the-research-workspace)
   - [5.2 Research Mode](#52-research-mode--topic-to-document)
   - [5.3 Chat](#53-chat--ask-arxio-anything)
   - [5.4 Library](#54-library--your-research-brain-forever)
   - [5.5 Presentation Mode](#55-presentation-mode)
   - [5.6 Sharing](#56-sharing--collaboration)
6. [User Flows](#6-user-flows)
7. [UI Design Guidelines](#7-ui-design-guidelines)
8. [Subscription Plans](#8-subscription-plans)
9. [Technical Architecture](#9-technical-architecture)
10. [Build Roadmap](#10-build-roadmap)
11. [Success Metrics](#11-success-metrics)
12. [Out of Scope](#12-out-of-scope--v1)
13. [Open Questions](#13-open-questions)

---

## 1. What is Arxio

Arxio is your **personal AI research brain**. It does two things better than anything else in the world:

1. **Upload any PDF** (research paper, book, report) — Arxio reads it completely and builds a full, beautiful workspace: summaries, concept explainers, methodology breakdowns, results analysis, presentation scripts, Q&A prep, cheat sheets, and downloadable files in every format — PPT, Word, PDF. Everything. Ready in minutes.

2. **Type any topic** — Arxio searches the web and academic databases, synthesizes everything it finds, and generates professional documents with real citations.

Every paper you upload. Every topic you research. Saved forever in your library. Chat with any of it. Share it. Come back anytime. **Your research brain, always on.**

---

## 2. The Problem

Students and researchers are losing hours every day to tasks that should take minutes.

### A Student's Night Before a Presentation

```
10:00 PM  —  Gets the research paper assignment
10:05 PM  —  Opens the 50-page IEEE paper. Overwhelmed.
10:30 PM  —  Still on page 8. Doesn't understand half the terms.
11:00 PM  —  Opens ChatGPT. Pastes sections. Gets generic answers.
11:30 PM  —  Tries Gamma. Confusing interface.
12:00 AM  —  Gives up on Gamma. Opens PowerPoint manually.
01:30 AM  —  Has 6 slides. Doesn't know what sir will ask.
02:00 AM  —  Sleeps stressed. Unprepared.
09:00 AM  —  Presentation. It shows.
```

### Why Existing Tools Fail

| Tool | What It Does | Why It Fails Students |
|---|---|---|
| ChatGPT / Claude | Answers questions | No structure, no files, no memory |
| Gamma | Makes PPTs | Confusing UI, no PDF understanding |
| ChatPDF | Chats with PDF | Only chat — no documents, no downloads |
| Notion AI | Writes docs | Complex setup, no PDF analysis, no PPT |
| Perplexity | Searches web | No document generation, no PDF mode |
| Google Scholar | Finds papers | Just search — no reading, no synthesis |

> Nobody has built the complete solution. Until Arxio.

---

## 3. The Vision

Arxio is not a summariser. Not a chatbot. Not a file generator.

**Arxio is a personal research brain** — a product so good that students will never want to open a research paper without it.

### The Arxio Promise

```
Upload a paper at 11 PM.
Walk into your presentation at 9 AM fully prepared.
Never open the original paper.
Never stress about what your professor will ask.
Never lose your research — saved, searchable, yours forever.
```

### The Magic Moment

```
11:00 PM  —  Opens Arxio. Uploads IEEE paper.
11:03 PM  —  Arxio finishes. Full workspace ready.
11:04 PM  —  Downloads the presentation. 15 slides. Perfect.
11:06 PM  —  Reads the cheat sheet. Knows every key term.
11:08 PM  —  Reads Q&A prep. Knows what sir will ask.
11:10 PM  —  Closes laptop. Sleeps confidently.

09:00 AM  —  Presentation. Nails it.
09:30 AM  —  Tells 5 friends about Arxio.
```

> That word of mouth is the growth engine.

---

## 4. Target Users

| User | Their Pain Today | What Arxio Gives Them |
|---|---|---|
| University Students | Can't understand research papers; presentations are stressful | Upload PDF → full workspace in minutes → walk in confident |
| PhD Researchers | Literature reviews take weeks; too many papers to read | Type topic → AI reads 20 papers → full report with citations |
| Master's Students | Need to present papers they barely understand | Complete presentation script + anticipated Q&A answers |
| Professionals | Need to brief teams on complex reports fast | Upload report → executive summary + PPT ready to present |
| Academics / Professors | Students come unprepared; office hours wasted | Students arrive better prepared; deeper discussions |
| Content Creators | Need research for videos, articles, newsletters | Type topic → sourced, cited research document instantly |

### Primary Target — University Students

The core user. Price-sensitive, tech-savvy, and the fastest growth channel because they talk to each other constantly. **One student who loves Arxio tells their entire class.** Win students and the product grows itself.

---

## 5. Core Features

### 5.1 PDF Mode — The Research Workspace

The hero feature. User uploads any PDF → Arxio builds a complete workspace.

#### What Gets Generated

| Output | What It Is | Format | When Needed |
|---|---|---|---|
| Paper Overview | What this paper is about in plain English | In-app / PDF / Word | First thing to read |
| Concept Explainer | Every technical term explained simply with analogies | PDF / Word | Before presenting |
| Methodology Breakdown | Step-by-step what researchers did in plain language | PDF / Word | When sir asks "how" |
| Results Analysis | What they found, what numbers mean, prior work comparison | PDF / Word | For Q&A prep |
| Critical Analysis | Strengths, real weaknesses, missing experiments, open questions | PDF / Word | To impress professor |
| Presentation Slides | 15-slide deck with beautiful template, real paper content | PPT (.pptx) | Day of presentation |
| Quick Pitch Deck | 5-slide version for short presentations | PPT (.pptx) | When time is short |
| Presentation Script | Word-for-word what to say, slide by slide | PDF / Word | Night before |
| Q&A Preparation | 10 questions professor likely to ask + perfect answers | PDF / Word | Night before |
| Cheat Sheet | One-page reference — key terms, results, talking points | PDF (print-ready) | During presentation |
| Literature Connections | Related papers, how this fits the broader field | PDF / Word | Deeper understanding |
| Full Bundle | Everything above in one download | `.zip` | Want everything |

> **Key Principle:** The user should never need to open the original paper. Every output must be complete, accurate, and immediately usable.

#### In-App Experience

- After upload → clean workspace with all outputs listed
- Each output has **preview** button — view in browser before downloading
- Download individual files or full bundle
- Every output permanently saved in user's library
- **Shareable link** for each workspace

---

### 5.2 Research Mode — Topic to Document

User types any topic → Arxio searches, reads, synthesises → generates professional documents with real citations.

#### Research Depth Options

| Mode | Sources | Quality | Time | Available To |
|---|---|---|---|---|
| Quick Research | 5 top web results (Tavily) | Good — covers basics | ~30 sec | All plans |
| Deep Research | 15–20 web sources + full scraping | Excellent — comprehensive | ~2 min | Pro + Scholar |
| Academic Mode | Semantic Scholar + Google Scholar | Expert — real citations | ~3 min | Scholar only |
| News Mode | NewsAPI — latest articles | Current — up to date | ~30 sec | Pro + Scholar |

#### Output Formats

| Format | What Gets Generated | Best For |
|---|---|---|
| PowerPoint (.pptx) | 15-slide deck, modern template, citations on last slide | Presentations |
| Word Document (.docx) | Full report with headings, body, citations, bibliography | Assignments |
| PDF | Clean, print-ready version | Submitting / sharing |
| Excel (.xlsx) | Data tables, statistics, comparison charts | Data-heavy topics |
| Research Report | Academic-style: abstract, literature review, findings, references | PhD / academic use |

---

### 5.3 Chat — Ask Arxio Anything

Every paper and research workspace has a **built-in chat**. Context-aware — knows everything about the specific paper.

#### Chat With a Paper

```
User:   What would my professor most likely ask me tomorrow?
Arxio:  Based on this paper, here are the 5 most likely questions...

User:   Explain self-attention like I am 10 years old
Arxio:  Imagine you are reading a sentence and you want to understand...

User:   Write me a confident 2-minute opening for my presentation
Arxio:  Good morning sir. Today I will be presenting a paper titled...
```

#### RAG — Chat Across All Papers (Scholar Plan Only)

```
User:   Which of my uploaded papers discuss attention mechanisms?
Arxio:  You have 4 papers on this topic:
        1. Attention Is All You Need (uploaded March 12)
        2. BERT: Pre-training of Deep Bidirectional Transformers (March 15)
        3. GPT-3: Language Models are Few-Shot Learners (March 20)
        4. Vision Transformer (March 22)
        Key connection: All four build on self-attention but apply it differently...

User:   Summarise the key differences between all four for my literature review
Arxio:  Here is a comparative analysis across your four papers...
```

---

### 5.4 Library — Your Research Brain, Forever

Every paper uploaded and every topic researched is **permanently saved**.

- All uploaded PDFs with their full generated workspaces
- All research topics with generated documents
- All presentations, Word docs, PDFs, Excel files ever generated
- All chat history with every paper
- **Smart search** across everything — find any paper, term, or concept
- Folders and tags to organise by subject, semester, or project

> **Why this matters:** A student uploads papers all semester. By exam time, their entire semester's reading is in Arxio — organised, searchable, and chatatable. Ask: *"Across all my papers this semester, what are the recurring themes?"* Not possible with any other tool.

---

### 5.5 Presentation Mode

Full in-browser presentation experience — no PowerPoint needed.

- Full-screen slide view — present directly from Arxio
- Speaker notes visible to presenter only
- Q&A cards accessible on the side during presentation
- Cheat sheet one click away
- Share link — professor or classmates can follow along
- Works on phone, tablet, and laptop

---

### 5.6 Sharing & Collaboration

- Every workspace gets a **shareable link**
- View-only links for sharing with professors
- Collaborate links for group projects (Pro and Scholar)
- Export and email any document directly from Arxio

---

## 6. User Flows

### 6.1 PDF Mode Flow

| Step | User Action | What Arxio Does | Time |
|---|---|---|---|
| 1 | Lands on arxio.in | Shows two options: Upload PDF / Research a Topic | 0 sec |
| 2 | Clicks Upload PDF | Shows clean drag-and-drop zone | 0 sec |
| 3 | Drops PDF file | Validates, shows filename + size + green checkmark | 1 sec |
| 4 | Clicks Generate | Shows animated processing screen with live status | 0 sec |
| 5 | Waits | `Reading intro...` → `Analysing methodology...` → `Building cheat sheet...` | 2–4 min |
| 6 | Workspace opens | All outputs listed — preview and download each | 0 sec |
| 7 | Downloads | PPT, Word, PDF, or full bundle zip | 1 sec |
| 8 | Chats | Asks questions, gets contextual answers | Anytime |
| 9 | Returns later | Everything saved in library | Anytime |

### 6.2 Research Mode Flow

| Step | User Action | What Arxio Does |
|---|---|---|
| 1 | Clicks Research a Topic | Shows topic input + depth + format selectors |
| 2 | Types topic | e.g. `Impact of climate change on coral reefs` |
| 3 | Picks depth | Quick / Deep / Academic / News |
| 4 | Picks format | PPT / Word / PDF / Excel / Research Report |
| 5 | Clicks Generate | AI searches web + papers, synthesises, generates |
| 6 | Document ready | Preview in browser, then download |
| 7 | Chat with it | Ask follow-up questions about the research |
| 8 | Saved to library | Permanently stored, searchable, shareable |

---

## 7. UI Design Guidelines

> North star: **Simpler than Gamma. More powerful than everything else.**

### Design Principles

- **One action per screen** — never overwhelm with choices
- **Progress always visible** — user should never wonder "is it working?"
- **Mobile first** — perfect on a phone, not just responsive
- **Dark mode from day one** — students work at night
- **Delight in the details** — small animations, satisfying transitions

### Key Screens

#### Screen 1 — Home / Landing

```
Hero:     "Your personal research brain."
Sub:      "Upload a PDF or type a topic. Get everything you need."

[ 📄  Upload a PDF ]          [ 🔍  Research a Topic ]
Drop your research paper        Type any topic, get
and get a full workspace        a full document back

Testimonials (3 short use cases)
Footer: Pricing summary | Sign up free
```

#### Screen 2 — PDF Upload

```
Large drag-and-drop zone
Accepted: PDF up to 50MB
After drop: filename + size + ✅ animation

[ Generate Workspace ]  ← one button, nothing else

Processing — live status messages:
  "Reading your paper..."
  "Analysing the methodology..."
  "Writing your cheat sheet..."
  "Building your presentation..."
  "Almost ready..."

Real progress bar. Estimated time shown.
```

#### Screen 3 — Research Mode

```
Input:  "What do you want to research?"
        Placeholder: "e.g. Role of AI in early cancer detection"

Depth:  [ Quick ]  [ Deep ]  [ Academic ]  [ News ]

Format: [ PPT ]  [ Word ]  [ PDF ]  [ Excel ]  [ Research Report ]

[ Generate Document ]  ← one button
```

#### Screen 4 — Workspace (PDF Result)

```
┌──────────────────────────────────────────┐
│  Paper title + authors + year            │
│  [ Share ]  [ Download All ]             │
├────────────┬─────────────────────────────┤
│  Sidebar   │  Preview Area               │
│  (30%)     │  (70%)                      │
│            │                             │
│ 📋 Cheat   │  Currently selected         │
│ 📄 Summary │  output renders here        │
│ 🧠 Concepts│                             │
│ 🔬 Method  │                             │
│ 📈 Results │                             │
│ ⚖️ Analysis│                             │
│ 📊 PPT     │                             │
│ 📝 Script  │                             │
│ ❓ Q&A     │                             │
│ 📦 All.zip │                             │
├────────────┴─────────────────────────────┤
│  💬 Ask anything about this paper...    │
│  [ Present ]  button — top right corner  │
└──────────────────────────────────────────┘
```

#### Screen 5 — Library

```
Search: searches across all papers, topics, generated content

Grid of paper cards:
  [ Paper Title          ]  [ Paper Title          ]
  [ Authors • Date       ]  [ Authors • Date       ]
  [ Open | Download | ⋯  ]  [ Open | Download | ⋯  ]

Folders: by subject (ML, Climate, Medicine...)
Tags: for easy filtering
```

---

## 8. Subscription Plans

### Plan Comparison

| Feature | Free | Student `$9/mo` | Pro `$19/mo` | Scholar `$39/mo` |
|---|---|---|---|---|
| **Target** | First-time / light use | University student | Professional | PhD / Researcher |
| PDF uploads / month | 3 | 20 | 60 | Unlimited |
| Research topics / month | 5 | 30 | 100 | Unlimited |
| PPT export (.pptx) | ❌ | ✅ | ✅ | ✅ |
| Excel export (.xlsx) | ❌ | ✅ | ✅ | ✅ |
| Chat with paper | ✅ 10 msg | ✅ 50 msg | ✅ Unlimited | ✅ Unlimited |
| RAG (chat across library) | ❌ | ❌ | ❌ | ✅ |
| Library history | 7 days | 6 months | Forever | Forever |
| Multiple PDF compare | ❌ | ❌ | ✅ | ✅ |
| Academic Mode | ❌ | ❌ | ❌ | ✅ |
| Presentation Mode | ❌ | ✅ | ✅ | ✅ |
| Share links | ❌ | ✅ | ✅ | ✅ |
| Priority AI (Claude) | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ❌ | ✅ |
| Processing speed | Standard | Standard | Fast | Fastest |
| Support | Community | Email | Priority Email | Dedicated |
| Annual discount | — | $79/yr (27% off) | $169/yr (26% off) | $349/yr (25% off) |

---

### Plan Details

#### 🆓 Free — The Hook
Good enough to experience the magic moment. 3 PDFs is enough to fall in love. Limitations (no PPT, 7-day history, basic chat) create natural upgrade pressure without frustrating the user.

#### 🎓 Student — $9/month — Core Revenue
Less than two coffees. Includes PPT and 6-month history — the two features students most want after the free plan. Annual: **$79/year**.

#### 💼 Pro — $19/month — The Professional
For professionals and heavy users. Adds priority AI (Claude Haiku), unlimited chat, multiple PDF comparison, forever history. Annual: **$169/year**.

#### 🔬 Scholar — $39/month — The Researcher
The flagship. RAG across entire paper library. Academic Mode with Semantic Scholar. API access. Built specifically for PhD students and academics. Annual: **$349/year**.

---

### Unit Economics

| Plan | AI Cost | Storage | Infra | Total Cost | Margin |
|---|---|---|---|---|---|
| Free | ~$0.05 | ~$0.02 | ~$0.10 | ~$0.17 | — |
| Student | ~$0.80 | ~$0.05 | ~$0.10 | ~$0.95 | ~$8.05 |
| Pro | ~$2.50 | ~$0.10 | ~$0.15 | ~$2.75 | ~$16.25 |
| Scholar | ~$5.00 | ~$0.20 | ~$0.20 | ~$5.40 | ~$33.60 |

> Total infra cost (VPS + domain + services): **~$10–25/month** at early stage. Profitable from the very first paying user.

---

### Upgrade Triggers

Contextual nudges at moments of friction — not popups:

- Free → tries to download PPT → `"PPT export is available on Student plan and above"`
- Free → 7-day history expires → `"Upgrade to Student to keep your library forever"`
- Free → hits 3 PDF limit → `"You have used your 3 free PDFs this month"`
- Student → tries to compare two papers → `"Paper comparison is a Pro feature"`
- Pro → wants academic citations → `"Academic mode with real citations is on Scholar plan"`

---

## 9. Technical Architecture

### Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Fast, modern, SEO-friendly |
| Backend | Python + FastAPI + UV | Best ecosystem for PDF + AI + file generation |
| AI (Free / Student) | Groq API — Llama 3.3 70B | 500+ tokens/sec, generous free tier |
| AI (Pro / Scholar) | Claude Haiku 3.5 (Anthropic) | Superior quality, worth the cost at Pro tier |
| RAG (Scholar) | Claude + vector embeddings | Chat across entire paper library |
| PDF Processing | PyMuPDF + pdfplumber | Deep extraction: text, tables, figures, equations |
| Web Search | Tavily API | Purpose-built for AI agents, returns clean text |
| Academic Search | Semantic Scholar API | 200M+ papers, completely free |
| News Search | NewsAPI | Latest articles, generous free tier |
| PPT Generation | python-pptx + templates | Real .pptx with professional designs |
| Word Generation | python-docx | Real .docx with proper formatting |
| PDF Generation | WeasyPrint | Clean, print-ready PDFs |
| Excel Generation | openpyxl | Real .xlsx with charts |
| Vector DB (RAG) | Qdrant | Fast semantic search across user papers |
| Database | MongoDB Atlas (Motor async) | Flexible document store, free tier |
| Cache + Queue | Redis + Celery | Background jobs for long AI tasks |
| File Storage | Cloudflare R2 | Cheap, fast object storage |
| Auth | FastAPI JWT + NextAuth.js | Secure, supports Google OAuth |
| Payments | Stripe | Handles subscriptions perfectly |
| Hosting | Hostinger VPS KVM 2 (8GB RAM) | $9/month, Ubuntu + Docker + Nginx |

---

### AI Pipeline — PDF Mode

```
1.  User uploads PDF → stored in Cloudflare R2
2.  PyMuPDF extracts full text + tables + figures
3.  Text chunked intelligently (by section, not by char count)
4.  Celery background job starts → user sees live progress
5.  AI (Groq / Claude by plan) receives paper + generation prompt
6.  AI generates all outputs in structured JSON
7.  Backend renders JSON → .docx / .pdf / .pptx
8.  All files stored in Cloudflare R2 under user account
9.  If Scholar plan → paper embedded into Qdrant for RAG
10. User notified → workspace ready
11. Files available for preview and download
```

### AI Pipeline — Research Mode

```
1.  User submits topic + depth + format
2.  Tavily API searches web → top 10–20 clean source texts
3.  If Academic mode → Semantic Scholar fetches relevant papers
4.  If News mode → NewsAPI fetches latest articles
5.  All sources sent to AI with synthesis prompt
6.  AI generates structured content: sections, key points, citations
7.  Backend renders into chosen format (PPT / Word / PDF / Excel)
8.  File stored in Cloudflare R2 and saved to library
9.  User previews and downloads
```

---

## 10. Build Roadmap

| Phase | Duration | What Gets Built | Done When |
|---|---|---|---|
| **Phase 1** — Foundation | 2–3 weeks | Hostinger VPS, Nginx, SSL, Docker. Next.js + FastAPI boilerplate. MongoDB + Redis. Auth (signup/login/dashboard). | User can log in and see empty dashboard |
| **Phase 2** — PDF Mode MVP | 3–4 weeks | PDF upload + PyMuPDF extraction. Groq AI integration. Generate: Overview, Concepts, Methodology, Results, Critical Analysis, Q&A, Cheat Sheet. Download as PDF + Word. Basic library. | User uploads PDF and downloads Word doc + cheat sheet |
| **Phase 3** — Presentations | 2–3 weeks | PPT generation with python-pptx + templates. Presentation mode in browser. Quick pitch (5 slides). Full bundle zip. | User uploads PDF and downloads beautiful PowerPoint |
| **Phase 4** — Research Mode | 3–4 weeks | Tavily + NewsAPI integration. Research mode UI. PPT + Word + PDF + Excel output with citations. | User types topic and downloads full research document |
| **Phase 5** — Chat | 2–3 weeks | Chat interface per workspace. Context-aware answers. Chat history saved. Plan-based message limits. | User chats with uploaded paper and gets accurate answers |
| **Phase 6** — Library + Polish | 2–3 weeks | Full library: search, folders, tags. Forever history for paid. Dark mode. Mobile polish. Performance. | Product feels polished on mobile and desktop |
| **Phase 7** — Payments + Beta | 2 weeks | Stripe — all 4 plans. Usage tracking + limits. Upgrade prompts. Beta with 20–50 real users. | 20 real users on paid plans, using it regularly |
| **Phase 8** — RAG + Scholar | 3–4 weeks | Qdrant vector embeddings. RAG — chat across library. Academic Mode (Semantic Scholar). API access for Scholar. | Scholar user chats across 10 uploaded papers seamlessly |
| **Phase 9** — Launch | Ongoing | Product Hunt. University communities. Twitter/X + LinkedIn. Referral program. Press outreach. | 1,000 registered users, 50 paying subscribers |

---

## 11. Success Metrics

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| Registered users | 100 | 1,000 | 5,000 | 25,000 |
| PDFs processed / month | 50 | 500 | 3,000 | 15,000 |
| Documents generated / month | 100 | 1,000 | 6,000 | 30,000 |
| Free → Paid conversion | — | 5% | 8% | 10% |
| Paying subscribers | 5 | 50 | 400 | 2,500 |
| MRR | $45 | $450 | $5,600 | $40,000 |
| Monthly churn | — | < 10% | < 7% | < 5% |
| NPS score | — | > 50 | > 60 | > 70 |
| Avg. generation time | < 4 min | < 3 min | < 2 min | < 90 sec |

---

## 12. Out of Scope — V1

The following will **not** be built in v1. Focus is everything.

- [ ] Mobile app (iOS / Android) — web only
- [ ] Real-time collaboration and co-editing
- [ ] Browser extension
- [ ] Google Drive / Notion / Dropbox integrations
- [ ] Custom AI model fine-tuning
- [ ] White-label / reseller programme
- [ ] Video or audio content processing
- [ ] Automated paper watching / alerts

> These are Phase 2+ decisions based on real user feedback.

---

## 13. Open Questions

- [ ] Register `arxio.ai` too? (Recommended: yes, today)
- [ ] How many PPT templates at launch? Who designs them?
- [ ] Should generated files auto-delete after 30 days for free users?
- [ ] Public gallery of example workspaces on landing page?
- [ ] Default citation format — APA, MLA, Chicago — or let user choose?
- [ ] Should free users need email signup or can they try anonymously?
- [ ] Referral programme reward — e.g. 1 extra PDF per referral?
- [ ] Student plan `.edu` email verification for a discount?

---

## Environment Variables (Dev Reference)

```env
# AI
GROQ_API_KEY=
ANTHROPIC_API_KEY=

# Search
TAVILY_API_KEY=
NEWS_API_KEY=

# Database
MONGODB_URI=
REDIS_URL=

# Storage
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=

# Vector DB
QDRANT_URL=
QDRANT_API_KEY=

# Auth
JWT_SECRET=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=https://arxio.in
```

---

## Repo Structure (Suggested)

```
arxio/
├── frontend/                  # Next.js 14
│   ├── app/
│   │   ├── page.tsx           # Landing
│   │   ├── dashboard/         # User dashboard
│   │   ├── workspace/[id]/    # PDF workspace
│   │   ├── research/          # Research mode
│   │   └── library/           # User library
│   ├── components/
│   │   ├── upload/            # PDF upload zone
│   │   ├── workspace/         # Workspace UI
│   │   ├── chat/              # Chat interface
│   │   ├── library/           # Library grid
│   │   └── presentation/      # Presentation mode
│   └── lib/
│       ├── api.ts             # API calls
│       └── auth.ts            # NextAuth config
│
├── backend/                   # FastAPI + UV
│   ├── pyproject.toml         # UV dependencies
│   ├── main.py                # Entry point
│   ├── routers/
│   │   ├── auth.py            # Auth routes
│   │   ├── pdf.py             # PDF upload + processing
│   │   ├── research.py        # Research mode
│   │   ├── chat.py            # Chat endpoints
│   │   ├── library.py         # Library CRUD
│   │   └── export.py          # File generation
│   ├── services/
│   │   ├── ai.py              # Groq / Claude integration
│   │   ├── pdf_processor.py   # PyMuPDF extraction
│   │   ├── search.py          # Tavily + NewsAPI
│   │   ├── academic.py        # Semantic Scholar
│   │   ├── rag.py             # Qdrant RAG
│   │   ├── ppt.py             # python-pptx generation
│   │   ├── docx.py            # python-docx generation
│   │   ├── pdf_gen.py         # WeasyPrint PDF
│   │   └── excel.py           # openpyxl generation
│   ├── models/
│   │   ├── user.py            # User model
│   │   ├── workspace.py       # Workspace model
│   │   └── document.py        # Document model
│   ├── workers/
│   │   └── tasks.py           # Celery background jobs
│   └── core/
│       ├── config.py          # Settings + env vars
│       ├── database.py        # MongoDB connection
│       ├── storage.py         # Cloudflare R2
│       └── security.py        # JWT
│
└── docker-compose.yml         # Local dev + production
```

---

*Arxio — arxio.in*  
*Powered by Drishti — दृष्टि — Vision. Clarity. Insight.*  
*Version 1.0 — April 2026*
