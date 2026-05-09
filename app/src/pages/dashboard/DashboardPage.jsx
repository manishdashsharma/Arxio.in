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

  const allowed = plan.pdfUploadAllowed && !uploading && !processing;

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const pdfUsed = plan.usage?.pdfsUsed ?? 0;
  const pdfLimit = plan.limits?.pdfs_per_month;
  const pdfPct = pdfLimit === -1 ? 0 : Math.min(100, Math.round((pdfUsed / (pdfLimit || 1)) * 100));

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

      {showUploadCelebration && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 text-xl">✓</div>
            <p className="font-bold text-slate-900">Uploaded successfully</p>
            <p className="mt-1 text-xs text-slate-400 truncate px-4">{celebrationMessage}</p>
          </div>
        </div>
      )}

      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50">

        {/* Header */}
        <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
              </h1>
              <p className="mt-0.5 text-xs text-slate-400">
                {workspaceMeta.total === 0
                  ? "Upload your first research paper to get started"
                  : `${workspaceMeta.total} workspace${workspaceMeta.total !== 1 ? "s" : ""} · ${completedCount} completed`}
              </p>
            </div>
            <div className="shrink-0">
              <PlanStatusStrip />
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 gap-5">

            {/* Banners */}
            {authFlash && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                <span><span className="font-semibold">{authFlash.title}:</span> {authFlash.detail}</span>
                <button type="button" onClick={() => setAuthFlash(null)} className="text-blue-400 hover:text-blue-700">✕</button>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
            )}
            {!plan.pdfUploadAllowed && pdfLimitModalDismissed && (
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <span>{PLAN_NUDGES.pdf_limit} <span className="font-semibold">{plan.formatPdfUsage()}</span></span>
                <button type="button" onClick={() => navigate("/billing")} className="font-semibold text-amber-700 hover:underline">Upgrade →</button>
              </div>
            )}

            {/* Upload card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Upload a paper</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF · Max 50MB · Up to 50 pages</p>
                </div>
                {pdfLimit !== -1 && plan.quotasReady && (
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 mb-1">{pdfUsed}/{pdfLimit} used</p>
                    <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${pdfPct > 85 ? "bg-rose-500" : "bg-blue-500"}`} style={{ width: `${pdfPct}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                {uploading ? (
                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Uploading your paper...</p>
                      <p className="text-xs text-slate-400">This will only take a moment</p>
                    </div>
                  </div>
                ) : latestWorkspaceId ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-500">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-emerald-800">Ready to generate</p>
                        <p className="text-xs text-emerald-600 truncate max-w-xs">{uploadSuccess || "File uploaded successfully"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/workspace/${latestWorkspaceId}`)}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Skip →
                      </button>
                      <Button
                        type="button"
                        onClick={onStartProcessing}
                        loading={processing}
                        disabled={processing}
                        className="rounded-xl px-5 py-2 text-xs"
                      >
                        Generate workspace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className={`group flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed py-10 transition-all ${allowed ? "border-slate-200 hover:border-blue-400 hover:bg-blue-50/40" : "cursor-not-allowed border-slate-100 opacity-40"}`}>
                    <input type="file" accept="application/pdf" className="hidden" onChange={onUploadChange} disabled={!allowed} />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 transition-all group-hover:border-blue-200 group-hover:bg-blue-50">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-slate-400 group-hover:text-blue-500 transition-colors">
                        <path d="M11 14V4M7 8l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Drop your PDF here or <span className="text-blue-600">browse</span></p>
                      <p className="mt-1 text-xs text-slate-400">Get a complete presentation, cheat sheet, and Q&amp;A prep in minutes</p>
                    </div>
                  </label>
                )}

                {uploadError && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Recent workspaces */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                <p className="text-sm font-bold text-slate-900">Recent workspaces</p>
                <button
                  type="button"
                  onClick={() => navigate("/workspaces")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  View all →
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader label="Loading..." />
                </div>
              ) : workspaceCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 3h8l4 4v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="#94a3b8" strokeWidth="1.3" fill="none"/><path d="M14 3v5h4" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No workspaces yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">Upload a PDF above to create your first workspace</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {workspaceCards.map((item, idx) => {
                    const key = item.workspaceId || item.id || idx;
                    const name = (item.title || "Untitled").replace(/\.pdf$/i, "").replace(/[_-]/g, " ").trim();
                    const isCompleted = String(item.status).toLowerCase() === WORKSPACE_STATUS.COMPLETED;
                    return (
                      <div
                        key={key}
                        onClick={() => item.workspaceId && navigate(`/workspace/${item.workspaceId}`)}
                        className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 2h6l4 4v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#3b82f6" strokeWidth="1.2" fill="none"/>
                            <path d="M9 2v4h4" stroke="#93c5fd" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.5 9h5M5.5 11.5h3" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(item.createdAt)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <StatusTag status={item.status} short />
                          {isCompleted && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-300 group-hover:text-blue-400 transition-colors">
                              <path d="M5 7l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-200 group-hover:text-slate-400 transition-colors">
                            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
