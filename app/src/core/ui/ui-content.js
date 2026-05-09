import { SIDEBAR_ITEM_KEY } from "./ui-enums";

export const SIDEBAR_CONTENT = Object.freeze({
  BRAND_TITLE: "Arxio",
  BRAND_SUBTITLE: "Student research workspace",
  USER_FALLBACK_NAME: "Operator",
  USER_ROLE_LABEL: "Learner",
  SIGN_OUT_LABEL: "Sign out",
  ITEMS: [
    { key: SIDEBAR_ITEM_KEY.DASHBOARD, label: "Dashboard", icon: "grid", to: "/dashboard" },
    { key: SIDEBAR_ITEM_KEY.WORKSPACES, label: "Workspaces", icon: "folder", to: "/workspaces" },
    // { key: SIDEBAR_ITEM_KEY.INTAKE, label: "Data Intake", icon: "database", href: "/dashboard#upload" },
    { key: SIDEBAR_ITEM_KEY.BILLING, label: "Plans", icon: "stack", to: "/billing" },
    { key: SIDEBAR_ITEM_KEY.PROFILE, label: "Profile", icon: "gear", to: "/profile" },
  ],
});

export const DASHBOARD_COPY = Object.freeze({
  HEADER_LABEL: "Your study dashboard",
  HERO_TITLE: "Upload paper. Get presentation-ready.",
  HERO_SUBTITLE: "Turn any PDF into structured notes, slides, and viva prep in one flow.",
  HERO_WELCOME_PREFIX: "Welcome back,",
  CTA_UPLOAD: "Upload PDF",
  CTA_OPEN_LATEST: "Open Latest",
  SNAPSHOT_KICKER: "Study Snapshot",
  SNAPSHOT_TITLE: "Your progress at a glance.",
  SNAPSHOT_SUBTITLE: "Keep momentum with quick upload, one-click workspace access, and visible status tracking.",
});

export const WORKSPACES_COPY = Object.freeze({
  CATALOG_KICKER: "Workspace Catalog",
  CATALOG_TITLE: "All Workspaces",
  HERO_KICKER: "Study Library",
  HERO_TITLE: "Everything you uploaded, organized in one place.",
  HERO_SUBTITLE: "Open any workspace to revise, practice Q&A, and export slides quickly.",
  EMPTY_STATE: "No workspace yet. Upload a PDF from dashboard to create one.",
  OPEN_WORKSPACE_LABEL: "Open workspace",
});

export const WORKSPACE_PAGE_COPY = Object.freeze({
  HEADER_LABEL: "Workspace",
  BACK_TO_DASHBOARD: "Dashboard",
  READY_BADGE: "Analysis ready",
  PROCESSING_FALLBACK_STEP: "Processing your paper…",
  PROCESSING_FAILED_FALLBACK: "Processing failed. Retry from the dashboard.",
  EXPORT_SECTION_TITLE: "Download presentation decks",
  EXPORT_SECTION_SUBTITLE: "Download generated PowerPoint files when your plan includes exports.",
  PREP_KICKER: "Student Prep Workspace",
  PREP_TITLE: "Study, practice, and present from one page",
  PREP_SUBTITLE: "Review concepts, rehearse answers, and export decks without jumping across multiple tools.",
  SOURCE_PREFIX: "Source file:",
});
