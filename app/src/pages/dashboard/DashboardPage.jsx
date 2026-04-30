import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader, StatusTag } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { listWorkspaces } from "../../core/api/dashboard-api";
import { getWorkspaceStatus, processWorkspace, uploadPdf } from "../../core/api/pdf-api";
import { PLAN_NUDGES } from "../../core/plan/nudges";
import { usePlan } from "../../core/plan/use-plan";
import { PlanStatusStrip } from "../../core/plan/PlanStatusStrip";
import { DASHBOARD_COPY } from "../../core/ui/ui-content";
import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";
import { PdfQuotaLimitModal } from "../../features/dashboard/components/PdfQuotaLimitModal";

const AUTH_FLASH_KEY = "arxio-auth-flash";
const AUTH_FLASH_MAX_AGE_MS = 15_000;
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const pendingCount = useMemo(() => recent.filter((w) => w.status === WORKSPACE_STATUS.PENDING).length, [recent]);
  const processingCount = useMemo(() => recent.filter((w) => w.status === WORKSPACE_STATUS.PROCESSING).length, [recent]);
  const completedCount = useMemo(() => recent.filter((w) => w.status === WORKSPACE_STATUS.COMPLETED).length, [recent]);
  const latestWorkspace = useMemo(() => recent[0] || null, [recent]);

  const workspaceCards = useMemo(
    () =>
      recent.length > 0
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
        : [],
    [recent],
  );

  return (
    <>
      <PdfQuotaLimitModal
        open={showPdfLimitModal}
        description={PLAN_NUDGES.pdf_limit}
        pdfUsageDisplay={plan.formatPdfUsage()}
        onDismiss={() => setPdfLimitModalDismissed(true)}
        onOpenProfile={() => navigate("/profile")}
        onUpgradePlan={() => navigate("/billing")}
      />
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
      <section className="relative flex h-full min-h-0 flex-col rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg p-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-arxio-surface-container/20 bg-white/85 px-3 py-3 backdrop-blur sm:px-4">
            <p className="text-sm font-semibold text-arxio-on-surface">
              {DASHBOARD_COPY.HERO_WELCOME_PREFIX} {user?.name || "Learner"}
            </p>
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[18rem]">
              <PlanStatusStrip />
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-10 pt-4 sm:px-4 sm:pb-12 sm:pt-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-arxio-outline-variant/20 bg-gradient-to-r from-white via-white to-blue-50/40 px-4 py-5 shadow-sm sm:mb-8 sm:px-5 sm:py-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-arxio-on-surface sm:text-3xl md:text-4xl">
                {DASHBOARD_COPY.HERO_TITLE}
              </h1>
              <p className="mt-2 text-sm text-arxio-on-surface-variant">
                {DASHBOARD_COPY.HERO_SUBTITLE}
              </p>
            </div>
            
          </div>

          <div className="relative mb-6 overflow-hidden rounded-2xl border border-arxio-outline-variant/20 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 px-4 py-4 sm:px-5 sm:py-5">
            <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">{DASHBOARD_COPY.SNAPSHOT_KICKER}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{DASHBOARD_COPY.SNAPSHOT_TITLE}</h2>
              <p className="mt-1 text-sm text-slate-600">{DASHBOARD_COPY.SNAPSHOT_SUBTITLE}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                  {workspaceMeta.total} Total
                </span>
                <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                  {completedCount} Completed
                </span>
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                  {pendingCount + processingCount} In Progress
                </span>
              </div>
            </div>
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
              className={`group relative overflow-hidden flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-arxio-outline-variant/45 bg-white p-5 text-center transition-colors sm:min-h-[16rem] sm:p-8 ${
                plan.pdfUploadAllowed && !uploading && !processing
                  ? "cursor-pointer hover:border-arxio-primary-container/50 hover:bg-arxio-surface-low"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <span className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-arxio-primary-container/12 blur-3xl" />
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
              <h2 className="text-xl font-bold tracking-tight text-arxio-on-surface sm:text-2xl">Drop your research paper</h2>
              <p className="mt-2 text-sm text-arxio-on-surface-variant">
                Upload once and we will create your summary, slides, script, and Q&A prep workspace.
              </p>
              <p className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-arxio-primary-container">Max file size: 50MB</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/80">
                  PDF
                </span>
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/50">
                  Notes
                </span>
                <span className="rounded border border-arxio-outline-variant/20 bg-arxio-surface-container-highest px-2 py-1 text-[10px] font-bold text-arxio-on-surface-variant/50">
                  Slides
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-arxio-on-surface-variant/80">
                <span className="rounded-full bg-arxio-surface-low px-2.5 py-1">1. Upload</span>
                <span className="rounded-full bg-arxio-surface-low px-2.5 py-1">2. Generate</span>
                <span className="rounded-full bg-arxio-surface-low px-2.5 py-1">3. Practice</span>
              </div>
            </label>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                onClick={onStartProcessing}
                disabled={!latestWorkspaceId || uploading || processing}
                loading={processing}
                className="rounded-lg px-5 py-2 text-xs"
              >
                Generate Workspace
              </Button>
              {(latestWorkspaceId || latestWorkspace?.workspaceId) && !processing ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-arxio-primary transition hover:text-arxio-on-surface"
                  onClick={() => navigate(`/workspace/${latestWorkspaceId || latestWorkspace?.workspaceId}`)}
                >
                  Go to workspace now
                </button>
              ) : null}
              {uploadError ? (
                <p className="max-w-2xl rounded border border-red-400/30 bg-red-950/25 px-3 py-2 text-center text-xs text-red-200">{uploadError}</p>
              ) : null}
              {latestWorkspaceId ? (
                <p className="max-w-xl text-center text-[10px] leading-relaxed text-arxio-on-surface-variant/85">
                  <button
                    type="button"
                    className="font-bold text-arxio-primary-container underline-offset-2 hover:underline"
                    onClick={() => navigate(`/workspace/${latestWorkspaceId}`)}
                  >
                    Open workspace
                  </button>
                  <span className="text-arxio-on-surface-variant/60"> · </span>
                  After you start processing, open the same page for full structured analysis, decks, and prep when the run completes.
                </p>
              ) : null}
            </div>
          </div>

          <div id="recent-workspaces" className="mt-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-arxio-primary-container">Recent Workspaces</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-arxio-on-surface-variant/60">{workspaceMeta.total} total</span>
                <button
                  type="button"
                  onClick={() => navigate("/workspaces")}
                  className="rounded-lg border border-arxio-outline-variant/30 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-arxio-on-surface-variant transition hover:border-arxio-primary-container/45 hover:text-arxio-primary"
                >
                  View all
                </button>
              </div>
            </div>
            {loading ? (
              <div className="mt-3"><Loader label="Loading..." /></div>
            ) : workspaceCards.length === 0 ? (
              <p className="mt-3 text-sm text-arxio-on-surface-variant/80">No workspace yet. Upload a PDF to create your first real workspace card.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {workspaceCards.map((item, idx) => (
                  (() => {
                    const key = item.workspaceId || item.id || `${item.title}-${item.createdAt || idx}`;
                    const isCompleted = String(item.status || "").toLowerCase() === WORKSPACE_STATUS.COMPLETED;
                    return (
                      <article
                        key={key}
                        className={`group relative overflow-hidden rounded-2xl border border-arxio-outline-variant/20 bg-white p-5 transition-all ${
                          item.canOpen ? "cursor-pointer hover:-translate-y-0.5 hover:border-arxio-primary-container/40 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]" : ""
                        }`}
                        onClick={() => {
                          if (!item.canOpen || !item.workspaceId) return;
                          navigate(`/workspace/${item.workspaceId}`);
                        }}
                      >
                        <span className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-arxio-primary-container to-arxio-tertiary" />
                        <div className="relative mb-4 flex items-start justify-between gap-2">
                          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-arxio-primary-container/25 bg-arxio-primary-container/12 text-arxio-primary-container">
                            {item.icon}
                          </div>
                          <StatusTag
                            status={item.status}
                            short
                            className={
                              isCompleted
                                ? "rounded-md px-2 py-0.5 text-[9px] font-black tracking-tighter"
                                : "rounded-md border-arxio-outline-variant/35 bg-arxio-surface-container-highest px-2 py-0.5 text-[9px] font-black text-arxio-on-surface-variant/80 tracking-tighter"
                            }
                          />
                        </div>
                        <p className="relative mb-1 truncate text-base font-bold text-arxio-on-surface group-hover:text-blue-700">
                          {item.title}
                        </p>
                        <p className="relative mb-5 line-clamp-2 text-xs leading-relaxed text-arxio-on-surface-variant/75">{item.subtitle}</p>
                        <p className="relative mb-3 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/55">Created {formatDate(item.createdAt)}</p>
                        <div className="relative grid grid-cols-2 gap-4 rounded-xl border border-arxio-outline-variant/15 bg-arxio-surface-low px-3 py-3 text-xs">
                          <div>
                            <p className="mb-1 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/55">{item.labelA}</p>
                            <p className="text-sm font-bold tracking-tight text-arxio-on-surface">{item.metricA}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[9px] uppercase tracking-widest text-arxio-on-surface-variant/55">{item.labelB}</p>
                            <p className="text-sm font-bold tracking-tight text-arxio-on-surface">{item.metricB}</p>
                          </div>
                        </div>
                        {item.canOpen ? (
                          <div className="relative mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-arxio-outline-variant/30 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-arxio-primary transition hover:bg-arxio-surface-low"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/workspace/${item.workspaceId}`);
                              }}
                            >
                              Open workspace
                            </button>
                            {!isCompleted ? (
                              <button
                                type="button"
                                className="group/refresh relative overflow-hidden rounded-lg bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
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
                            ) : null}
                          </div>
                        ) : null}
                        <div className="mt-4 border-t border-arxio-outline-variant/15 pt-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                            Continue workspace
                            <span aria-hidden>→</span>
                          </span>
                        </div>
                      </article>
                    );
                  })()
                ))}
              </div>
            )}
          </div>

          </div>
      </section>
    </>
  );
}
