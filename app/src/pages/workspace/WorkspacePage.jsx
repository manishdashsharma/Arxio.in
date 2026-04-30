import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader, Button, StatusTag } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { downloadWorkspaceExport } from "../../core/api/export-api";
import { getWorkspace } from "../../core/api/pdf-api";
import { PLAN_NUDGES } from "../../core/plan/nudges";
import { usePlan } from "../../core/plan/use-plan";
import { PlanStatusStrip } from "../../core/plan/PlanStatusStrip";
import { WORKSPACE_PAGE_COPY } from "../../core/ui/ui-content";
import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";
import { StructuredAnalysisPanel } from "../../features/workspace/components/StructuredAnalysisPanel";
import { WorkspaceChatPanel } from "../../features/workspace/components/WorkspaceChatPanel";
import { formatAuthors, formatFileSize } from "../../features/workspace/lib/analysis-utils";
import { useWorkspaceStatus } from "../../features/workspace/hooks/useWorkspaceStatus";

export function WorkspacePage() {
  const { workspaceId = "" } = useParams();
  const { user } = useAuth();
  const plan = usePlan();
  const { status, loading: statusLoading, error: statusError } = useWorkspaceStatus(workspaceId);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");
  const [exportBusy, setExportBusy] = useState(null);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (!workspaceId) return undefined;
    const normalized = String(status?.status || "").toLowerCase();
    if (normalized !== WORKSPACE_STATUS.COMPLETED && normalized !== WORKSPACE_STATUS.FAILED) return undefined;
    let cancelled = false;
    async function fetchWorkspace() {
      try {
        const data = await getWorkspace(workspaceId);
        if (!cancelled) {
          setWorkspace(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to fetch workspace.");
        }
      }
    }
    fetchWorkspace();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, status?.status]);

  const analysis = useMemo(() => {
    const raw = workspace?.analysis;
    return raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  }, [workspace?.analysis]);

  const fileStem = useMemo(() => {
    const name = workspace?.originalName || "paper";
    return String(name).replace(/\.pdf$/i, "").replace(/[/\\?%*:|"<>]/g, "").slice(0, 80) || "paper";
  }, [workspace?.originalName]);

  const heroTitle = useMemo(() => {
    if (analysis && typeof analysis.paperTitle === "string" && analysis.paperTitle.trim()) {
      return analysis.paperTitle.trim();
    }
    return workspace?.originalName || `Workspace ${workspaceId.slice(-8)}`;
  }, [analysis, workspace?.originalName, workspaceId]);

  const heroSubtitle = useMemo(() => {
    if (!analysis) return "";
    const parts = [];
    const authorsLine = formatAuthors(analysis.authors);
    if (authorsLine) parts.push(authorsLine);
    if (analysis.year) parts.push(String(analysis.year));
    if (typeof analysis.venue === "string" && analysis.venue.trim()) parts.push(analysis.venue.trim());
    return parts.join(" · ");
  }, [analysis]);

  const slideCount = useMemo(() => {
    const s = analysis?.slides;
    return Array.isArray(s) ? s.length : 0;
  }, [analysis?.slides]);

  const runExport = useCallback(
    async (format) => {
      if (!workspaceId) return;
      setExportBusy(format);
      setExportError("");
      try {
        await downloadWorkspaceExport(workspaceId, format, fileStem);
      } catch (err) {
        setExportError(err instanceof Error ? err.message : "Export failed.");
      } finally {
        setExportBusy(null);
      }
    },
    [workspaceId, fileStem],
  );

  const progress = useMemo(() => {
    const percent = status?.percent ?? 0;
    return Math.max(0, Math.min(100, Number(percent) || 0));
  }, [status?.percent]);

  const normalizedStatus = String(status?.status || "").toLowerCase();
  const isCompleted = normalizedStatus === WORKSPACE_STATUS.COMPLETED;
  const isFailed = normalizedStatus === WORKSPACE_STATUS.FAILED;

  const pptAllowed = plan.allows("ppt");

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-arxio-surface-container/20 bg-white/85 px-3 py-3 backdrop-blur sm:px-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-arxio-on-surface-variant/70">{WORKSPACE_PAGE_COPY.HEADER_LABEL}</p>
              <h1 className="truncate text-lg font-bold tracking-tight text-arxio-on-surface md:text-xl">
                {workspace?.originalName || `ID: ${workspaceId}`}
              </h1>
            </div>
            <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-start">
              <Link
                to="/dashboard"
                className="rounded-lg border border-arxio-outline-variant/30 px-3 py-1.5 text-[11px] font-semibold text-arxio-on-surface-variant transition hover:border-arxio-primary-container/40 hover:text-arxio-on-surface"
              >
                {WORKSPACE_PAGE_COPY.BACK_TO_DASHBOARD}
              </Link>
              <StatusTag status={status?.status} />
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-7 pt-3 sm:px-4 sm:pb-8 sm:pt-4">
            <PlanStatusStrip className="mb-4" />

            {statusLoading ? (
              <div className="mt-4">
                <Loader label="Syncing workspace…" />
              </div>
            ) : null}

            {statusError || error ? (
              <p className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">{statusError || error}</p>
            ) : null}

            {status && !isCompleted ? (
              <div className="mt-4 rounded-2xl border border-arxio-outline-variant/20 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-arxio-on-surface">{status.step || WORKSPACE_PAGE_COPY.PROCESSING_FALLBACK_STEP}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-arxio-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-arxio-primary-container to-arxio-tertiary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-arxio-on-surface-variant">{progress}% completed</p>
                {isFailed ? (
                  <p className="mt-3 text-xs text-rose-700">{status.errorMessage || WORKSPACE_PAGE_COPY.PROCESSING_FAILED_FALLBACK}</p>
                ) : null}
              </div>
            ) : null}

            {isCompleted ? (
              <div className="flex min-h-0 flex-1 flex-col gap-8">
                {workspace && analysis ? (
                  <div className="relative overflow-hidden rounded-3xl border border-arxio-outline-variant/25 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                    <div className="pointer-events-none absolute inset-0 arxio-grid-overlay opacity-[0.35]" />
                    <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-arxio-primary-container/25 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-arxio-tertiary/20 blur-3xl" />
                    <div className="relative arxio-workspace-hero-mask px-6 pb-8 pt-7 md:px-9 md:pb-10 md:pt-9">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          {WORKSPACE_PAGE_COPY.READY_BADGE}
                        </span>
                        {slideCount ? (
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-arxio-on-surface-variant/70">
                            {slideCount} slide outline{slideCount === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-4 max-w-4xl text-balance text-3xl font-bold leading-snug tracking-tight text-arxio-on-surface md:text-4xl">
                        {heroTitle}
                      </h2>
                      {heroSubtitle ? (
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-arxio-on-surface-variant md:text-base">{heroSubtitle}</p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-arxio-on-surface-variant/60">
                        {WORKSPACE_PAGE_COPY.SOURCE_PREFIX} <span className="text-arxio-on-surface-variant">{workspace.originalName}</span>
                      </p>

                      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-arxio-outline-variant/20 bg-white/80 px-4 py-3 sm:max-w-[11rem]">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-arxio-on-surface-variant/60">Pages</span>
                          <span className="mt-1 text-xl font-bold tabular-nums text-arxio-on-surface">{workspace.pageCount ?? "—"}</span>
                        </div>
                        <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-arxio-outline-variant/20 bg-white/80 px-4 py-3 sm:max-w-[11rem]">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-arxio-on-surface-variant/60">Words</span>
                          <span className="mt-1 text-xl font-bold tabular-nums text-arxio-on-surface">{workspace.wordCount ?? "—"}</span>
                        </div>
                        <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-arxio-outline-variant/20 bg-white/80 px-4 py-3 sm:max-w-[11rem]">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-arxio-on-surface-variant/60">File size</span>
                          <span className="mt-1 text-xl font-bold tabular-nums text-arxio-on-surface">{formatFileSize(workspace.fileSize)}</span>
                        </div>
                        <div className="flex min-w-[7.5rem] flex-1 flex-col rounded-xl border border-arxio-outline-variant/20 bg-white/80 px-4 py-3 sm:max-w-[11rem]">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-arxio-on-surface-variant/60">Plan</span>
                          <span className="mt-1 truncate text-sm font-bold uppercase tracking-wide text-arxio-primary">{plan.displayName}</span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-3 border-t border-arxio-outline-variant/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold text-arxio-on-surface">{WORKSPACE_PAGE_COPY.EXPORT_SECTION_TITLE}</p>
                          <p className="mt-0.5 text-[11px] text-arxio-on-surface-variant/75">{WORKSPACE_PAGE_COPY.EXPORT_SECTION_SUBTITLE}</p>
                          {exportError ? <p className="mt-2 text-xs text-rose-700">{exportError}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-10 rounded-xl border-arxio-outline-variant/40 bg-white px-4 text-xs"
                            disabled={!pptAllowed || !workspace.hasPptx || exportBusy !== null}
                            loading={exportBusy === "pptx"}
                            title={!pptAllowed ? PLAN_NUDGES.ppt : !workspace.hasPptx ? "Deck not available." : "15-slide deck"}
                            onClick={() => runExport("pptx")}
                          >
                            15-slide PPTX
                          </Button>
                          <Button
                            type="button"
                            className="min-h-10 rounded-xl px-4 text-xs"
                            disabled={!pptAllowed || !workspace.hasQuickPptx || exportBusy !== null}
                            loading={exportBusy === "quick_pptx"}
                            title={!pptAllowed ? PLAN_NUDGES.ppt : !workspace.hasQuickPptx ? "Quick deck not available." : "Quick pitch"}
                            onClick={() => runExport("quick_pptx")}
                          >
                            Quick pitch PPTX
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Loader label="Loading structured analysis..." />
                  </div>
                )}

              </div>
            ) : null}

            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2 rounded-2xl border border-arxio-outline-variant/20 bg-white p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-arxio-primary-container">{WORKSPACE_PAGE_COPY.PREP_KICKER}</p>
                  <h3 className="mt-1 text-lg font-bold tracking-tight text-arxio-on-surface">{WORKSPACE_PAGE_COPY.PREP_TITLE}</h3>
                  <p className="mt-1 max-w-2xl text-xs text-arxio-on-surface-variant/85">
                    {WORKSPACE_PAGE_COPY.PREP_SUBTITLE}
                  </p>
                </div>
              </div>

              {isCompleted ? (
                workspace ? (
                  <StructuredAnalysisPanel analysis={analysis} embedMeta={{ omitPaperHeader: Boolean(analysis?.paperTitle) }} />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Loader label="Loading structured analysis..." />
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6">
                  <p className="text-sm font-medium text-slate-700">Structured analysis will appear here after processing completes.</p>
                  <p className="mt-1 text-xs text-slate-500">You can use Study Chat meanwhile for quick Q&A and speaking scripts.</p>
                </div>
              )}
            </div>

            {workspaceId ? (
              <div className="mt-6">
                <WorkspaceChatPanel
                  workspaceId={workspaceId}
                  workspaceReady={isCompleted}
                  chatAllowed={Boolean(plan.chatAllowed)}
                  onUsageSync={plan.refresh}
                />
              </div>
            ) : null}
          </div>
    </section>
  );
}
