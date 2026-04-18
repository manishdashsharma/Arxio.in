# Arxio — UI Design Brief
**For the UI/UX Designer**
Version 1.0 | April 2026

---

## What is Arxio?

Arxio is an AI-powered research tool. A student uploads a 50-page research paper at 11 PM, and by 11:10 PM they have a complete 15-slide presentation, a cheat sheet, Q&A prep, flashcards, and a chat assistant that knows the entire paper.

The magic moment: **upload → done in 10 minutes → sleep confidently.**

There is also a second mode — Research Mode — where a user types any topic (e.g. "Impact of AI in healthcare") and Arxio searches the web, synthesizes sources, and generates a full research document + presentation.

---

## Core Design Principles

- **Dark mode by default.** Students work at night. Light mode is secondary.
- **One action per screen.** The user should never wonder what to do next.
- **Progress is always visible.** Never a blank wait. Always a status message.
- **Mobile first.** Design for 390px, scale up.
- **No popups for upsell.** Nudges only at the moment of friction — inline, contextual.
- **Delight in details.** Subtle animations on upload success, workspace ready. This is what students screenshot and share.

---

## Tech Stack (for reference)
- Next.js 14, TypeScript, Tailwind CSS
- Dark navy color palette (designer has full freedom on exact tokens)

---

## Screens — Complete List

### 1. Landing Page `/`
**Purpose:** Convert visitor to signup.

**Sections:**
- Hero — headline, subheadline, one primary CTA ("Try free — no card needed"), one secondary CTA ("See how it works")
- How it works — 3 steps: Upload → AI Analyses → Download & Present
- Output showcase — show what gets generated (slide preview, cheat sheet preview, Q&A cards)
- Pricing section — 4 plans: Free / Student ($9) / Pro ($19) / Scholar ($39). Student plan has "Most Popular" badge.
- Footer — links, tagline

**Notes:**
- This is SSR — SEO matters here
- Hero must communicate the magic moment in under 5 seconds
- Pricing cards: Free, Student (highlighted), Pro, Scholar — each with feature list and CTA

---

### 2. Signup Page `/signup`
**Fields:** Name, Email, Password
**Also:** Google OAuth button
**After signup:** Redirect to `/verify-email`

---

### 2b. Email Verification `/verify-email`
- Shown after signup before user can access dashboard
- Message: "We sent a verification code to your email"
- 6-digit OTP input
- "Verify" button
- "Resend code" link (cooldown 30 seconds)
- After verification: redirect to `/dashboard`
- Unverified users who try to access dashboard are redirected here

---

### 3. Login Page `/login`
**Fields:** Email, Password
**Also:** Google OAuth button, "Forgot password?" link
**After login:** Redirect to `/dashboard`

---

### 4. Forgot Password `/forgot-password`
- Email input → "Send OTP"
- OTP input screen → "Verify"
- New password screen → "Reset Password"
- 3-step inline flow (no page navigation, just state changes)

---

### 5. Dashboard `/dashboard`
**This is the home screen after login. Two things happen here:**

**5a. Upload Area (default state)**
- Large drag-and-drop zone: "Drop your PDF here or click to upload"
- Accepted: PDF only, max 50MB
- Below the drop zone: recent workspaces (last 3 cards)
- Top right: "Research Mode" button → goes to Research input

**5b. Processing Screen (after upload)**
- Full-screen or modal overlay — do not let user navigate away accidentally
- Large animated progress bar
- Live status message updates (examples):
  - "Reading your paper..."
  - "Extracting text and tables..."
  - "AI is reading the full paper..."
  - "Building your presentation..."
  - "Your workspace is ready ✓"
- Percentage shown (10% → 20% → 35% → 45% → 65% → 80% → 90% → 100%)
- On completion: auto-redirect to `/workspace/[id]`

**5c. Processing Failed State**
- Show error message: "Something went wrong. Please try again."
- "Try Again" button — re-triggers processing
- "Upload a different file" link — back to upload
- Do not auto-redirect. User must take action.

---

### 6. Workspace `/workspace/[id]`
**This is the most important screen in the product.**

**Layout: 3-column**
```
[Sidebar 20%] [Preview Pane 55%] [Chat 25%]
```

**Left Sidebar — Output Navigator**
List of all generated outputs. Clicking one loads it in the preview pane.
- Overview
- Core Story
- Problem Statement
- Key Terms (5–8 terms with definitions)
- Methodology
- Results & Key Findings
- Critical Analysis
- Literature Connections
- Slides (15-slide deck preview)
- Quick Slides (5-slide)
- Presentation Script
- Q&A Prep (10 questions: 2 easy, 5 medium, 3 hard)
- Cheat Sheet
- Flashcards (15 cards)
- Further Reading
- Technical Reference

**Center — Preview Pane**
Renders the selected output as a clean in-app view. Not a raw JSON dump.

Examples:
- **Slides** → card-style slide preview with title, bullets, speaker notes toggle
- **Q&A Prep** → accordion cards, color-coded by difficulty (green=easy, yellow=medium, red=hard)
- **Flashcards** → flip card interaction, front=question, back=answer
- **Key Terms** → definition cards with analogy
- **Cheat Sheet** → dense one-page layout, print-friendly

**Top bar of workspace:**
- Paper title + author
- "Download PPT" button (15-slide) — locked on Free plan
- "Download Quick PPT" button (5-slide) — locked on Free plan
- "Download All (ZIP)" — both PPTs in one zip — locked on Free plan
- "Presentation Mode" button
- Share button (locked on Free plan)

**Right Panel — Chat**
- Message history (scrollable)
- Input box at bottom: "Ask anything about this paper..."
- Locked with nudge for Free users who hit the 10 message limit
- Scholar plan users get smarter answers (RAG-powered, not visible to user)

**Mobile:** Sidebar becomes a bottom sheet or tab bar. Chat collapses to a floating button.

---

### 7. Presentation Mode
**Triggered from workspace — full-screen takeover**

- One slide at a time, full viewport
- Navigation: left/right arrows or keyboard
- Speaker notes panel: toggle show/hide (bottom drawer)
- Slide counter: "3 / 15"
- Exit button top-right
- Works for both 15-slide and 5-slide decks

---

### 8. Research Mode `/research`
**Entry:** "Research Mode" button on dashboard

**8a. Input Screen**
- Large text input: "What do you want to research?"
- Example topics shown as chips: "AI in autonomous vehicles", "Climate change economics"
- CTA: "Generate Research"
- Below: recent research jobs (last 3 cards)

**8b. Processing Screen**
Same as PDF processing — live progress with messages:
- "Searching the web..."
- "Gathering sources..."
- "AI is synthesising sources..."
- "Building your presentation..."
- "Your research is ready ✓"

**8c. Research Workspace `/research/[id]`**
Similar layout to PDF workspace but outputs are different:
- Executive Summary
- Sections (5–8 topic sections)
- Key Findings
- Slides (15-slide)
- Quick Slides (5-slide)
- Data Insights
- Citations
- Conclusion
- Limitations

**Top bar of research workspace:**
- Topic title
- "Download PPT" button (15-slide) — locked on Free plan
- "Download Quick PPT" button (5-slide) — locked on Free plan
- "Download All (ZIP)" — locked on Free plan
- "Presentation Mode" button

No chat on research (chat is PDF-workspace only).

---

### 9. Library `/library`
**All past work in one place — PDFs and research jobs merged.**

- Search bar at top
- Grid or list view toggle
- Each card shows:
  - Icon: PDF icon or Research icon
  - Title (filename or topic)
  - Status badge: completed / processing / failed
  - Date
  - Click → goes to workspace or research result

---

### 10. Pricing Page `/pricing`
Can be a separate page or part of landing. Same 4 plan cards.
Used for upgrade nudges — link to this from plan gate banners.

---

### 11. Settings `/settings`
- Profile: name, email, avatar
- Plan: current plan, usage this month (e.g. "2 of 3 PDFs used"), upgrade CTA
- Access Key: input field to enter early access key and select plan (mock payment for now)
- Danger zone: delete account

---

## Navigation (Authenticated)

**Sidebar nav — visible on all authenticated screens:**
- Logo / wordmark (top)
- Dashboard
- Library
- Research
- Settings
- User avatar + name + plan badge (bottom)
- Logout button (bottom, below avatar)

**Top navbar — within workspace/research screens:**
- Back arrow → Library
- Workspace/topic title (truncated)
- Action buttons (download, share, presentation mode)

**Mobile nav:** Bottom tab bar — Dashboard, Library, Research, Settings.

---

## Plan Gate Nudges
These appear inline — never as popups.

| Trigger | Message |
|---|---|
| Free user tries to download PPT | "PPT export is available on Student plan and above" + Upgrade button |
| Free user hits 10 chat messages | "You've used your 10 free messages this month. Upgrade to Student for 50." |
| Free user tries to upload 4th PDF | "You've used your 3 free PDFs this month. Upgrade to continue." |
| Free user tries to share | "Sharing is available on Student plan and above" |

---

## Empty States

Every empty state needs an illustration or icon + message + CTA.

| Screen | Empty State |
|---|---|
| Dashboard — no uploads yet | "Upload your first paper" + drop zone |
| Library — no items | "Nothing here yet. Upload a PDF or start a research topic." |
| Chat — no messages | "Ask anything about this paper. I know every detail." |
| Research — no jobs | "What do you want to research?" |

---

## Key User Flows

### Flow 1 — New user, first PDF
```
Landing → Signup → Dashboard → Upload PDF → Processing Screen (10 min) → Workspace → Browse outputs → Try chat → Hit chat limit → See nudge → Pricing
```

### Flow 2 — Returning user
```
Login → Dashboard → See recent workspaces → Click workspace → Browse outputs → Download PPT (if paid)
```

### Flow 3 — Research Mode
```
Dashboard → Research Mode → Type topic → Processing (2-3 min) → Research Workspace → View sections → Download PPT
```

### Flow 4 — Upgrade
```
Hit any limit → See inline nudge → Settings or Pricing → Enter access key → Select plan → Upgraded → New token on next login
```

---

## Component List (reusable)

- `Button` — primary, secondary, ghost, danger, icon-only
- `Card` — workspace card, research card (with status badge)
- `Badge` — plan badge (Free/Student/Pro/Scholar), status badge
- `ProgressBar` — animated, with label
- `Spinner` — for loading states
- `PlanGateBanner` — inline nudge strip
- `SlideCard` — slide preview with bullets + speaker notes
- `QACard` — question + answer, difficulty color
- `FlashCard` — flip interaction
- `DropZone` — PDF upload area
- `ChatMessage` — user and assistant bubbles
- `Sidebar` — collapsible output navigator
- `Modal` — confirmation dialogs only (not upsell)
- `Toast` — success / error notifications

---

## Screens Summary

| # | Screen | Auth Required |
|---|---|---|
| 1 | Landing `/` | No |
| 2 | Signup `/signup` | No |
| 3 | Login `/login` | No |
| 4 | Forgot Password `/forgot-password` | No |
| 5 | Dashboard `/dashboard` | Yes |
| 6 | PDF Workspace `/workspace/[id]` | Yes |
| 7 | Presentation Mode (overlay) | Yes |
| 8 | Research Input `/research` | Yes |
| 9 | Research Workspace `/research/[id]` | Yes |
| 10 | Library `/library` | Yes |
| 11 | Pricing `/pricing` | No |
| 12 | Settings `/settings` | Yes |

**Total: 12 screens** (+ processing states which are screen states, not separate routes)

---

## What the Designer Does NOT Need to Worry About
- Backend API structure
- Authentication tokens
- How AI works
- Mobile app (web only for v1)
- Email templates (handled separately)

---

## Appendix — Actual Data Shapes from the API

This section shows the exact JSON the frontend receives. Every field listed here is real — the designer can use these to design with real content, not placeholders.

---

### User Object
Returned on login, stored in session. Used in sidebar avatar, settings page, plan badge.

```json
{
  "id": "6620a1...",
  "name": "Ayesha Sharma",
  "email": "ayesha@example.com",
  "avatar": null,
  "plan": "student",
  "is_verified": true,
  "is_subscribed": true,
  "pdfs_used_this_month": 2,
  "research_used_this_month": 1,
  "chat_messages_used_this_month": 7,
  "created_at": "2026-04-14T18:00:00Z"
}
```

**Notes for design:**
- `plan` → one of `"free"` | `"student"` | `"pro"` | `"scholar"` — drives plan badge and locked state
- `pdfs_used_this_month` → used in Settings usage bar (e.g. "2 of 3 PDFs used")
- `avatar` is `null` for most users — always design with a fallback initial avatar

---

### Plan Object
Returned from `GET /subscription/plans`. Used on Pricing page and Settings.

```json
{
  "tier": "student",
  "name": "Student",
  "tagline": "For students who take presentations seriously",
  "price": 9,
  "currency": "USD",
  "billing": "monthly",
  "highlight": true,
  "features": [
    "20 PDFs per month",
    "30 research topics per month",
    "50 chat messages per month",
    "PPT export — 15-slide & 5-slide decks",
    "In-browser presentation mode",
    "Share workspace links",
    "180-day history"
  ],
  "limits": {
    "pdfs_per_month": 20,
    "research_per_month": 30,
    "chat_messages": 50,
    "ppt": true,
    "rag": false,
    "academic_mode": false,
    "history_days": 180,
    "presentation_mode": true,
    "share_links": true,
    "comparison": false,
    "priority_ai": false
  }
}
```

**All 4 plans at a glance:**

| Field | Free | Student | Pro | Scholar |
|---|---|---|---|---|
| `price` | 0 | 9 | 19 | 39 |
| `highlight` | false | **true** | false | false |
| `pdfs_per_month` | 3 | 20 | 60 | -1 (unlimited) |
| `research_per_month` | 5 | 30 | 100 | -1 |
| `chat_messages` | 10 | 50 | -1 | -1 |
| `ppt` | false | true | true | true |
| `history_days` | 7 | 180 | -1 (forever) | -1 |
| `rag` | false | false | false | true |

**Notes for design:**
- `-1` means unlimited — render as "Unlimited" in UI
- `highlight: true` → "Most Popular" badge on Student plan card
- `features[]` is already formatted, render as a bullet list directly

---

### Workspace Object (PDF)
Returned from `GET /pdf/:id`. The main data object for `/workspace/[id]`.

```json
{
  "id": "6621b2...",
  "userId": "6620a1...",
  "originalName": "lane_detection_vilds.pdf",
  "fileSize": 2048576,
  "status": "completed",
  "processingStep": "Your workspace is ready",
  "processingPercent": 100,
  "pageCount": 12,
  "wordCount": 8450,
  "pptxAvailable": true,
  "quickPptxAvailable": true,
  "createdAt": "2026-04-18T23:00:00Z",
  "updatedAt": "2026-04-18T23:10:00Z",
  "analysis": { }
}
```

**`status` values:**
- `"pending"` → just uploaded, not yet processing
- `"processing"` → Celery task running — show processing screen
- `"completed"` → workspace ready — render outputs
- `"failed"` → something went wrong — show retry state

**Notes for design:**
- `originalName` → display as the workspace title (truncate long filenames)
- `pageCount` + `wordCount` → optional metadata shown in workspace header
- `pptxAvailable` / `quickPptxAvailable` → drives the enabled/locked state of download buttons
- `analysis` → the full AI output object (see below)

---

### Status Object (during processing)
Returned from `GET /pdf/:id/status` — frontend polls this every 2s during processing.

```json
{
  "status": "processing",
  "step": "Building your presentation...",
  "percent": 65
}
```

**Progress steps in order:**
1. `"Reading your paper..."` — 10%
2. `"Extracting text and tables..."` — 20%
3. `"Analysing the methodology..."` — 35%
4. `"AI is reading the full paper..."` — 45%
5. `"Building your presentation..."` — 65%
6. `"Building your quick pitch deck..."` — 80%
7. `"Saving your workspace..."` — 90%
8. `"Your workspace is ready"` — 100%

**Research Mode progress steps:**
1. `"Searching the web..."` — 10%
2. `"Gathering sources..."` — 25%
3. `"AI is synthesising sources..."` — 45%
4. `"Building your presentation..."` — 70%
5. `"Building your quick pitch deck..."` — 85%
6. `"Your research is ready"` — 100%

**Notes for design:**
- `step` is the live status message — render verbatim in the processing screen
- `percent` drives the progress bar fill
- Stop polling when `status` is `"completed"` or `"failed"`

---

### Analysis Object — PDF (inside `workspace.analysis`)
This is the AI output. Every section in the left sidebar maps to a key in this object.

```json
{
  "paperTitle": "VILDS: Vision-Based Intelligent Lane Detection System",
  "authors": ["Mohammed Al-Rawi", "Sarah Chen"],
  "year": 2024,
  "venue": "IEEE Transactions on Intelligent Transportation Systems",

  "overview": "5-sentence plain English overview of the paper...",

  "coreStory": {
    "problem": "Lane detection fails at night and in rain because...",
    "solution": "VILDS uses a dual-stream CNN that processes both...",
    "keyResult": "98.2% lane detection accuracy on KAIST dataset...",
    "soWhat": "Tesla and Waymo both face this exact problem in..."
  },

  "problemStatement": "3-4 sentences explaining what was broken before...",

  "keyTerms": [
    {
      "term": "Convolutional Neural Network",
      "definition": "A type of AI model that processes images by...",
      "analogy": "Like how your eye focuses on edges before seeing the full picture..."
    }
  ],

  "methodology": {
    "summary": "4-5 sentences on what they did...",
    "steps": ["Step 1: Searched 7 databases...", "Step 2: ..."],
    "tools": ["PyTorch", "CARLA simulator", "OpenCV"],
    "datasets": ["KAIST dataset (10,000 images)", "CULane (133,000 frames)"],
    "whyThisApproach": "2-3 sentences on why this over alternatives..."
  },

  "results": {
    "summary": "4-5 sentences on findings...",
    "keyFindings": [
      "VILDS achieved 98.2% accuracy on KAIST dataset, outperforming all prior methods",
      "Inference speed of 47ms per frame enables real-time use at 21 FPS"
    ],
    "comparisonToPriorWork": "Outperformed UFLD by 3.4% and LaneNet by 5.1%...",
    "whatTheNumbersMean": "98.2% means fewer than 2 in 100 lane departures are missed..."
  },

  "criticalAnalysis": {
    "strengths": ["First system to combine..."],
    "weaknesses": ["Only tested on daytime highway data..."],
    "openQuestions": ["How does it perform in construction zones?"],
    "futureWork": "3-4 sentences on what comes next...",
    "whatYouWouldChange": "If I were the author, I would have tested on..."
  },

  "slides": [
    {
      "slideNumber": 1,
      "title": "VILDS: Vision-Based Intelligent Lane Detection System",
      "bullets": ["Mohammed Al-Rawi, Sarah Chen", "IEEE TITS 2024"],
      "speakerNote": "Good morning everyone. Today I'm presenting VILDS..."
    }
  ],

  "quickSlides": [
    {
      "slideNumber": 1,
      "title": "...",
      "bullets": [],
      "speakerNote": ""
    }
  ],

  "presentationScript": {
    "opening": "What if your car's lane detection failed at 11 PM in the rain?...",
    "closing": "VILDS shows that 98.2% accuracy is achievable today..."
  },

  "qaPrep": [
    {
      "question": "What makes VILDS different from existing lane detection systems?",
      "answer": "VILDS differs in three key ways... [6-8 sentences]",
      "difficulty": "medium",
      "whyTheyAskThis": "Tests whether the student can articulate novelty"
    }
  ],

  "cheatSheet": {
    "coreStory": {
      "problem": "...",
      "solution": "...",
      "keyResult": "...",
      "soWhat": "..."
    },
    "keyTerms": [
      { "term": "CNN", "definition": "AI model that processes images layer by layer" }
    ],
    "keyNumbers": [
      "98.2% — lane detection accuracy on KAIST dataset",
      "47ms — inference time per frame"
    ],
    "methodologyInThreeLines": [
      "Built a dual-stream CNN trained on KAIST and CULane datasets",
      "Tested against UFLD, LaneNet, and SCNN baselines",
      "Novel: first to combine semantic segmentation with depth estimation"
    ],
    "talkingPoints": [
      "The core innovation is the dual-stream architecture that...",
      "The results show 98.2% accuracy which means..."
    ],
    "fallbackAnswers": [
      {
        "trigger": "If sir asks about the dataset",
        "say": "We used the KAIST dataset which has 10,000 annotated images covering..."
      }
    ],
    "doNotSay": [
      "Do not say VILDS works in all weather — it was only tested in..."
    ]
  },

  "flashcards": [
    {
      "question": "What accuracy did VILDS achieve on the KAIST dataset?",
      "answer": "98.2% lane detection accuracy, outperforming all prior baselines including UFLD (94.8%) and LaneNet (93.1%)."
    }
  ],

  "technicalReference": {
    "algorithmsOrTechniques": [
      {
        "name": "Semantic Segmentation",
        "oneLiner": "Assigns a label to every pixel in the image",
        "bestFor": "Understanding scene structure",
        "usedInThisPaper": true
      }
    ],
    "architectureComponents": [
      {
        "component": "Dual-Stream Encoder",
        "purpose": "Processes RGB and depth maps in parallel"
      }
    ]
  },

  "literatureConnections": [
    {
      "title": "Ultra Fast Structure-aware Deep Lane Detection (UFLD)",
      "relation": "Primary baseline VILDS outperformed by 3.4%"
    }
  ],

  "furtherReading": [
    {
      "trigger": "If sir asks about the Sim-to-Real gap",
      "topic": "Transfer learning from simulation to real-world deployment",
      "whatToSay": "The foundational work by Tobin et al. (2017) on domain randomisation shows...",
      "searchQuery": "domain randomization sim-to-real transfer Tobin 2017"
    }
  ]
}
```

**Sidebar → analysis key mapping:**

| Sidebar Item | `analysis` key |
|---|---|
| Overview | `overview` |
| Core Story | `coreStory` |
| Problem Statement | `problemStatement` |
| Key Terms | `keyTerms[]` |
| Methodology | `methodology` |
| Results & Key Findings | `results` |
| Critical Analysis | `criticalAnalysis` |
| Literature Connections | `literatureConnections[]` |
| Slides (15) | `slides[]` |
| Quick Slides (5) | `quickSlides[]` |
| Presentation Script | `presentationScript` |
| Q&A Prep | `qaPrep[]` |
| Cheat Sheet | `cheatSheet` |
| Flashcards | `flashcards[]` |
| Further Reading | `furtherReading[]` |
| Technical Reference | `technicalReference` |

---

### Analysis Object — Research Mode (inside `researchJob.analysis`)
Used in `/research/[id]` workspace. Different keys from PDF analysis.

```json
{
  "title": "Impact of AI in Healthcare: A 2024 Synthesis",

  "executiveSummary": "AI is reshaping healthcare diagnostics, drug discovery, and...",

  "sections": [
    {
      "heading": "AI in Diagnostics",
      "content": "3-5 paragraphs of synthesised content...",
      "keyPoints": [
        "FDA approved 521 AI-enabled devices as of 2023",
        "Radiology AI reduces reading time by 40% in clinical trials"
      ]
    }
  ],

  "keyFindings": [
    "AI diagnostic tools achieve 94.5% accuracy in detecting diabetic retinopathy",
    "Drug discovery timelines reduced from 12 years to 4 years using AI simulation"
  ],

  "slides": [
    {
      "slideNumber": 1,
      "title": "Impact of AI in Healthcare",
      "bullets": ["Synthesised from 10 web sources", "April 2026"],
      "speakerNote": "Today we explore how AI is transforming..."
    }
  ],

  "dataInsights": [
    {
      "insight": "521 FDA-approved AI medical devices as of 2023",
      "source": "FDA AI/ML Action Plan"
    }
  ],

  "citations": [
    {
      "number": 1,
      "title": "FDA Artificial Intelligence and Machine Learning Action Plan",
      "url": "https://www.fda.gov/...",
      "type": "government"
    }
  ],

  "conclusion": "AI in healthcare is no longer experimental — it is deployed at scale...",

  "limitations": "This synthesis is based on publicly available web sources as of April 2026..."
}
```

**Research Sidebar → analysis key mapping:**

| Sidebar Item | `analysis` key |
|---|---|
| Executive Summary | `executiveSummary` |
| Sections (5–8) | `sections[]` — each has `heading`, `content`, `keyPoints[]` |
| Key Findings | `keyFindings[]` |
| Slides (15) | `slides[]` |
| Quick Slides (5) | first 5 of `slides[]` |
| Data Insights | `dataInsights[]` |
| Citations | `citations[]` |
| Conclusion | `conclusion` |
| Limitations | `limitations` |

---

### Research Job Object
Returned from `GET /research/:id`.

```json
{
  "id": "6622c3...",
  "userId": "6620a1...",
  "topic": "Impact of AI in healthcare",
  "status": "completed",
  "processingStep": "Your research is ready",
  "processingPercent": 100,
  "pptxAvailable": true,
  "quickPptxAvailable": true,
  "createdAt": "2026-04-18T22:00:00Z",
  "updatedAt": "2026-04-18T22:05:00Z",
  "analysis": { }
}
```

---

### Library Item Object
Returned from `GET /library/`. Merges PDF workspaces + research jobs into one list.

```json
{
  "id": "6621b2...",
  "type": "pdf",
  "title": "lane_detection_vilds.pdf",
  "status": "completed",
  "createdAt": "2026-04-18T23:00:00Z"
}
```

```json
{
  "id": "6622c3...",
  "type": "research",
  "title": "Impact of AI in healthcare",
  "status": "completed",
  "createdAt": "2026-04-18T22:00:00Z"
}
```

**Notes for design:**
- `type: "pdf"` → show PDF icon, link to `/workspace/[id]`
- `type: "research"` → show Research icon, link to `/research/[id]`
- `status` → `"pending"` | `"processing"` | `"completed"` | `"failed"` — drives status badge colour
- `title` is the raw filename for PDFs (include `.pdf`) — truncate at ~40 chars

---

### Chat Message Object
Returned from `GET /chat/:workspaceId/history`.

```json
{
  "items": [
    {
      "id": "6623d4...",
      "workspaceId": "6621b2...",
      "role": "user",
      "content": "What accuracy did VILDS achieve?",
      "createdAt": "2026-04-18T23:15:00Z"
    },
    {
      "id": "6623d5...",
      "workspaceId": "6621b2...",
      "role": "assistant",
      "content": "VILDS achieved 98.2% lane detection accuracy on the KAIST dataset...",
      "createdAt": "2026-04-18T23:15:02Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 20,
    "hasNextPage": false
  }
}
```

**Notes for design:**
- `role: "user"` → right-aligned bubble
- `role: "assistant"` → left-aligned bubble with Arxio avatar
- Messages are ordered oldest-first — scroll to bottom on load

---

### Subscription Status Object
Returned from `GET /subscription/`. Used in Settings → Plan section.

```json
{
  "plan": {
    "tier": "student",
    "name": "Student",
    "price": 9,
    "tagline": "For students who take presentations seriously"
  },
  "usage": {
    "pdfs_used": 2,
    "research_used": 1,
    "chat_messages_used": 7
  },
  "limits": {
    "pdfs_per_month": 20,
    "research_per_month": 30,
    "chat_messages": 50,
    "ppt": true,
    "history_days": 180
  }
}
```

**Notes for design:**
- Settings usage bar: `pdfs_used / pdfs_per_month` → "2 of 20 PDFs used this month"
- If `limits.chat_messages === -1` → "Unlimited"
- If `limits.pdfs_per_month === -1` → "Unlimited"

---

*Arxio — arxio.in | Drishti — दृष्टि — Vision. Clarity. Insight.*
