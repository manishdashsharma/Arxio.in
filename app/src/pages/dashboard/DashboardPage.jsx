import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { listWorkspaces } from "../../core/api/dashboard-api";
import { getWorkspaceStatus, processWorkspace, uploadPdf } from "../../core/api/pdf-api";
import { PLAN_NUDGES } from "../../core/plan/nudges";
import { usePlan } from "../../core/plan/use-plan";
import { CyberSidebar } from "../../features/dashboard/components/CyberSidebar";

const AUTH_FLASH_KEY = "arxio-auth-flash";
const AUTH_FLASH_MAX_AGE_MS = 15_000;
export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const plan = usePlan();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authFlash, setAuthFlash] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [statusRefreshId, setStatusRefreshId] = useState("");
  const [showUploadCelebration, setShowUploadCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [pdfLimitModalDismissed, setPdfLimitModalDismissed] = useState(false);
  const [latestWorkspaceId, setLatestWorkspaceId] = useState("");
  const [recent, setRecent] = useState([]);
  const [workspaceMeta, setWorkspaceMeta] = useState({
    total: 0,
    page: 1,
    limit: 5,
    hasNextPage: false,
  });

  function formatBytes(bytes) {
    if (!bytes || Number.isNaN(Number(bytes))) return "N/A";
    const value = Number(bytes);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(iso) {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  async function refreshWorkspaceList(page = 1, limit = workspaceMeta.limit || 5) {
    const workspaces = await listWorkspaces(page, limit);
    setRecent(workspaces?.items || []);
    setWorkspaceMeta({
      total: workspaces?.pagination?.total || 0,
      page: workspaces?.pagination?.page || page,
      limit: workspaces?.pagination?.limit || limit,
      hasNextPage: Boolean(workspaces?.pagination?.hasNextPage),
    });
    return workspaces;
  }

  async function onUploadChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploadSuccess("");
    setLatestWorkspaceId("");
    setUploading(true);
    try {
      const result = await uploadPdf(file);
      setLatestWorkspaceId(result?.workspace?.workspaceId || "");
      const successText = `Uploaded ${result?.workspace?.originalName || file.name} successfully.`;
      setUploadSuccess(successText);
      setCelebrationMessage(successText);
      setShowUploadCelebration(true);
      await refreshWorkspaceList(1, workspaceMeta.limit || 5);
      await plan.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function onStartProcessing() {
    if (!latestWorkspaceId) return;
    setProcessing(true);
    setUploadError("");
    try {
      await processWorkspace(latestWorkspaceId);
      setUploadSuccess("Processing started. You can track this workspace in the recent list.");
      navigate(`/workspace/${latestWorkspaceId}`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not start processing.");
    } finally {
      setProcessing(false);
    }
  }

  async function onFetchLatestStatus(workspaceId) {
    if (!workspaceId) return;
    setStatusRefreshId(workspaceId);
    setUploadError("");
    try {
      const latest = await getWorkspaceStatus(workspaceId);
      setRecent((prev) =>
        prev.map((item) =>
          item.workspaceId === workspaceId ? { ...item, status: latest?.status || item.status, pageCount: latest?.pageCount ?? item.pageCount } : item,
        ),
      );
      setUploadSuccess(`Latest status: ${String(latest?.status || "unknown").toUpperCase()}`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not refresh workspace status.");
    } finally {
      setStatusRefreshId("");
    }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_FLASH_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      sessionStorage.removeItem(AUTH_FLASH_KEY);
      if (!parsed?.title || !parsed?.detail || !parsed?.ts) return;
      if (Date.now() - parsed.ts > AUTH_FLASH_MAX_AGE_MS) return;
      queueMicrotask(() => setAuthFlash(parsed));
    } catch {
      // no-op if storage/json parse fails
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const workspaces = await listWorkspaces(1, 5);
        if (cancelled) return;
        setRecent(workspaces?.items || []);
        setWorkspaceMeta({
          total: workspaces?.pagination?.total || 0,
          page: workspaces?.pagination?.page || 1,
          limit: workspaces?.pagination?.limit || 5,
          hasNextPage: Boolean(workspaces?.pagination?.hasNextPage),
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!showUploadCelebration) return undefined;
    const timer = window.setTimeout(() => setShowUploadCelebration(false), 2600);
    return () => window.clearTimeout(timer);
  }, [showUploadCelebration]);

  useEffect(() => {
    if (plan.pdfUploadAllowed) queueMicrotask(() => setPdfLimitModalDismissed(false));
  }, [plan.pdfUploadAllowed]);

  const showPdfLimitModal =
    plan.quotasReady && !plan.pdfUploadAllowed && !pdfLimitModalDismissed && !showUploadCelebration;

  const pendingCount = recent.filter((w) => w.status === "pending").length;
  const processingCount = recent.filter((w) => w.status === "processing").length;
  const completedCount = recent.filter((w) => w.status === "completed").length;

  const planMetricsPending = plan.loading || !plan.quotasReady;
  const metricCards = [
    { label: "PDF Usage", value: loading || planMetricsPending ? "..." : plan.formatPdfUsage() },
    { label: "Workspaces Total", value: loading ? "..." : String(workspaceMeta.total) },
    { label: "Pending/Processing", value: `${pendingCount}/${processingCount}` },
    { label: "Completed (page)", value: String(completedCount) },
    { label: "Plan Tier", value: loading || planMetricsPending ? "..." : plan.displayName.toUpperCase() },
  ];
  const workspaceCards = recent.length > 0
    ? recent.map((item) => ({
        id: item.id,
        title: item.title || item.originalName || "Untitled workspace",
        status: item.status || "active",
        subtitle: "Uploaded workspace ready for processing and outputs.",
        metricA: item.pageCount ?? "N/A",
        metricB: formatBytes(item.fileSize),
        labelA: "Pages",
        labelB: "File Size",
        createdAt: item.createdAt,
        icon: "⌂",
        canOpen: true,
        workspaceId: item.workspaceId,
      }))
    : [];

  return (
    <main className="min-h-screen bg-arxio-bg p-2 text-arxio-on-surface selection:bg-arxio-primary-container selection:text-white">
      {showPdfLimitModal ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="pdf-limit-title"
          aria-describedby="pdf-limit-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPdfLimitModalDismissed(true);
          }}
        >
          <div
            className="arxio-glass relative w-full max-w-md overflow-hidden rounded-xl border border-amber-500/35 px-6 py-6 text-center shadow-[0_0_50px_rgba(15,98,254,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-2xl text-amber-200">
              !
            </div>
            <p id="pdf-limit-title" className="mt-4 text-lg font-black uppercase tracking-tight text-arxio-on-surface">
              PDF quota reached
            </p>
            <p id="pdf-limit-desc" className="mt-2 text-sm leading-relaxed text-arxio-on-surface-variant">
              {PLAN_NUDGES.pdf_limit}
            </p>
            <p className="mt-3 text-2xl font-black tracking-tight text-arxio-primary-container">{plan.formatPdfUsage()}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-arxio-on-surface-variant/70">
              Billing period usage
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="rounded-sm border border-arxio-outline-variant/30 bg-arxio-surface-container px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-arxio-on-surface transition hover:bg-arxio-surface-container-high"
                onClick={() => setPdfLimitModalDismissed(true)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="rounded-sm bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:brightness-110"
                onClick={() => {
                  setPdfLimitModalDismissed(true);
                  navigate("/profile");
                }}
              >
                Open profile
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showUploadCelebration ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="arxio-glass relative w-[92%] max-w-md overflow-hidden rounded-xl border border-arxio-outline-variant/20 px-5 py-5 text-center arxio-header-shadow">
            <span className="absolute left-6 top-6 h-2 w-2 animate-ping rounded-full bg-arxio-primary-container/80" />
            <span className="absolute right-8 top-8 h-1.5 w-1.5 animate-ping rounded-full bg-arxio-inverse-primary [animation-delay:140ms]" />
            <span className="absolute bottom-8 left-10 h-1.5 w-1.5 animate-ping rounded-full bg-arxio-primary/60 [animation-delay:220ms]" />
            <span className="absolute bottom-7 right-9 h-2 w-2 animate-ping rounded-full bg-arxio-primary-container [animation-delay:80ms]" />
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-arxio-primary-container/40 bg-arxio-primary-container/15 text-2xl text-arxio-on-surface">
              ✓
            </div>
            <p className="mt-3 text-lg font-semibold text-arxio-on-surface">Upload Complete</p>
            <p className="mt-1 text-sm text-arxio-on-surface-variant">{celebrationMessage}</p>
          </div>
        </div>
      ) : null}
      <div className="grid min-h-[calc(100vh-16px)] w-full gap-3 rounded-2xl border border-arxio-outline-variant/15 bg-arxio-surface-low p-3 md:grid-cols-[16rem_1fr]">
        <CyberSidebar
          user={user}
          onSignOut={signOut}
          activeItem="dashboard"
          workspaceLink="/workspaces"
        />

        <section className="relative flex min-h-0 flex-col rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg p-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-arxio-surface-container/20 bg-arxio-bg/80 px-4 py-2 backdrop-blur-xl arxio-header-shadow">
            <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-tighter">
              <span className="text-arxio-on-surface-variant/50">Query System...</span>
              <span className="border-b-2 border-arxio-primary-container pb-1 text-arxio-primary-container">Network Status</span>
              <span className="text-arxio-on-surface-variant/50 transition-opacity hover:text-arxio-on-surface">System Logs</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-sm bg-arxio-primary-container px-4 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:brightness-110"
              >
                Deploy Core
              </button>
              <div className="h-4 w-px bg-arxio-surface-container" />
              <span className="h-2 w-2 rounded-full bg-arxio-on-surface-variant/30" />
              <span className="h-2 w-2 rounded-full bg-arxio-on-surface-variant/30" />
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-12 pt-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black uppercase leading-none tracking-tighter text-arxio-on-surface md:text-4xl">
                Intelligence Hub
              </h1>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-arxio-on-surface-variant/60">
                Synchronized with Alpha-9 Satellite Array
              </p>
            </div>
            <button
              type="button"
              disabled={!plan.researchAllowed}
              title={!plan.researchAllowed ? PLAN_NUDGES.research_limit : `${plan.formatResearchUsage()} — research workflow`}
              onClick={() => {
                if (!plan.researchAllowed) return;
                setUploadSuccess("Research mode screen is shipping next. Your research quota is active.");
              }}
              className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            >
              Research Mode
            </button>
          </div>

          {authFlash ? (
            <div className="mb-2 rounded border border-arxio-outline-variant/20 bg-arxio-surface-container/40 px-3 py-1.5 text-[11px] text-arxio-on-surface" role="status">
              <span className="font-semibold">{authFlash.title}:</span> {authFlash.detail}
              <button type="button" className="ml-2 text-arxio-primary hover:text-arxio-on-surface" onClick={() => setAuthFlash(null)}>Dismiss</button>
            </div>
          ) : null}
          {error ? <p className="mb-2 rounded border border-red-400/30 bg-red-950/30 px-3 py-1.5 text-[11px] text-red-200">{error}</p> : null}
          {uploadSuccess ? (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-arxio-outline-variant/20 bg-arxio-surface-container/40 px-3 py-1.5 text-[11px] text-arxio-on-surface" role="status">
              <span>{uploadSuccess}</span>
              <button type="button" className="text-arxio-primary hover:text-arxio-on-surface" onClick={() => setUploadSuccess("")}>
                Dismiss
              </button>
            </div>
          ) : null}
          {plan.error ? (
            <p className="mb-2 rounded border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-100">
              Plan data could not be refreshed ({plan.error}). Limits shown match your account tier until sync succeeds.
            </p>
          ) : null}

          <div id="upload" className="mb-10 space-y-3">
            {!plan.pdfUploadAllowed && pdfLimitModalDismissed ? (
              <p className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container/40 px-3 py-2 text-center text-[11px] text-arxio-on-surface-variant">
                {PLAN_NUDGES.pdf_limit}{" "}
                <span className="text-arxio-primary-container">{plan.formatPdfUsage()}</span>
              </p>
            ) : null}
            <label
              className={`arxio-glass group flex min-h-[16rem] flex-col items-center justify-center rounded-xl border border-dashed border-arxio-outline-variant/40 p-8 text-center transition-colors ${
                plan.pdfUploadAllowed && !uploading && !processing
                  ? "cursor-pointer hover:border-arxio-primary-container/50"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onUploadChange}
                disabled={uploading || processing || !plan.pdfUploadAllowed}
              />
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-arxio-primary-container/10 text-arxio-primary-container transition-transform group-hover:scale-110">
                <span className="text-4xl" aria-hidden="true">
                  ↑
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-arxio-on-surface">Initiate Data Ingestion</h2>
              <p className="mt-2 text-sm font-medium tracking-tight text-arxio-on-surface-variant">
                Drop your PDF here or click to upload.
              </p>
              <p className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-arxio-primary-container">Max File Density: 50MB</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/80">
                  PDF
                </span>
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/50">
                  JSON
                </span>
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/50">
                  CSV
                </span>
              </div>
            </label>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                onClick={onStartProcessing}
                disabled={!latestWorkspaceId || uploading || processing}
                loading={processing}
                className="rounded-sm px-4 py-1.5 text-[10px]"
              >
                Generate Workspace
              </Button>
              {uploadError ? (
                <p className="max-w-2xl rounded border border-red-400/30 bg-red-950/25 px-3 py-2 text-center text-xs text-red-200">{uploadError}</p>
              ) : null}
            </div>
          </div>

          <div id="recent-workspaces" className="mt-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-arxio-primary-container">Recent Workspaces</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-arxio-on-surface-variant/40" />
                <span className="h-2.5 w-2.5 rounded-sm bg-arxio-on-surface-variant/25" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3"><Loader label="Loading..." /></div>
            ) : workspaceCards.length === 0 ? (
              <p className="mt-3 text-sm text-arxio-on-surface-variant/80">No workspace yet. Upload a PDF to create your first real workspace card.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {workspaceCards.map((item) => (
                  <article
                    key={item.id}
                    className={`group rounded-lg border border-arxio-outline-variant/15 bg-arxio-surface-container p-5 transition-colors ${
                      item.canOpen ? "cursor-pointer hover:bg-arxio-surface-container-high" : ""
                    }`}
                    onClick={() => {
                      if (!item.canOpen || !item.workspaceId) return;
                      navigate(`/workspace/${item.workspaceId}`);
                    }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-arxio-primary-container/20 text-arxio-primary-container">
                        {item.icon}
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                          String(item.status).toLowerCase() === "completed"
                            ? "bg-arxio-tertiary-container/20 text-arxio-tertiary"
                            : "bg-arxio-surface-container-highest text-arxio-on-surface-variant/70"
                        }`}
                      >
                        {(item.status || "active").toUpperCase().slice(0, 9)}
                      </span>
                    </div>
                    <p className="mb-1 truncate text-sm font-bold text-arxio-on-surface group-hover:text-arxio-primary">
                      {item.title}
                    </p>
                    <p className="mb-6 line-clamp-2 text-[10px] leading-relaxed text-arxio-on-surface-variant/70">{item.subtitle}</p>
                    <p className="mb-3 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/50">Created {formatDate(item.createdAt)}</p>
                    <div className="grid grid-cols-2 gap-4 border-t border-arxio-outline-variant/10 pt-4 text-xs">
                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/50">{item.labelA}</p>
                        <p className="text-sm font-bold tracking-tighter text-arxio-on-surface">{item.metricA}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/50">{item.labelB}</p>
                        <p className="text-sm font-bold tracking-tighter text-arxio-on-surface">{item.metricB}</p>
                      </div>
                    </div>
                    {item.canOpen ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-sm border border-arxio-outline-variant/25 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-arxio-primary transition hover:bg-arxio-surface-container-high"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/workspace/${item.workspaceId}`);
                          }}
                        >
                          Open workspace
                        </button>
                        <button
                          type="button"
                          className="group/refresh relative overflow-hidden rounded-sm bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFetchLatestStatus(item.workspaceId);
                          }}
                          disabled={statusRefreshId === item.workspaceId}
                        >
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition group-hover/refresh:translate-x-full" />
                          <span className="relative inline-flex items-center gap-1.5">
                            <span className={`${statusRefreshId === item.workspaceId ? "animate-spin" : "animate-pulse"} text-[11px]`}>⟳</span>
                            {statusRefreshId === item.workspaceId ? "Refreshing..." : "Fetch latest status"}
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card, i) => (
              <div
                key={card.label}
                className="arxio-glass flex items-center justify-between rounded border border-arxio-outline-variant/10 p-4"
              >
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-arxio-on-surface-variant/50">{card.label}</p>
                  <p className={`mt-1 text-lg font-bold leading-none text-arxio-on-surface ${i === 3 ? "text-arxio-tertiary" : ""}`}>{card.value}</p>
                </div>
                <span className="inline-block h-4 w-4 shrink-0 rounded-sm bg-arxio-primary-container/35" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-arxio-on-surface-variant/50">
            Page {workspaceMeta.page} · Limit {workspaceMeta.limit} · Total {workspaceMeta.total} · Has next page:{" "}
            {workspaceMeta.hasNextPage ? "Yes" : "No"}
          </p>

          <button
            type="button"
            className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-xl bg-arxio-primary-container text-2xl font-bold text-white shadow-[0_0_30px_rgba(15,98,254,0.4)] transition hover:scale-105 active:scale-95"
            aria-label="Quick add"
          >
            +
          </button>
          </div>
        </section>
      </div>
    </main>
  );
}
