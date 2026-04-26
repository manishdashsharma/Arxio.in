import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader, Button } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { PLAN_NUDGES } from "../../core/plan/nudges";
import { usePlan } from "../../core/plan/use-plan";
import { getWorkspace } from "../../core/api/pdf-api";
import { CyberSidebar } from "../../features/dashboard/components/CyberSidebar";
import { useWorkspaceStatus } from "../../features/workspace/hooks/useWorkspaceStatus";

export function WorkspacePage() {
  const { workspaceId = "" } = useParams();
  const { user, signOut } = useAuth();
  const plan = usePlan();
  const { status, loading: statusLoading, error: statusError } = useWorkspaceStatus(workspaceId);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    async function fetchWorkspace() {
      try {
        const data = await getWorkspace(workspaceId);
        if (!cancelled) setWorkspace(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to fetch workspace.");
      }
    }
    if (status?.status === "completed" || status?.status === "failed") {
      fetchWorkspace();
    }
    return () => {
      cancelled = true;
    };
  }, [workspaceId, status?.status]);

  const progress = useMemo(() => {
    const percent = status?.percent ?? 0;
    return Math.max(0, Math.min(100, Number(percent) || 0));
  }, [status?.percent]);

  return (
    <main className="min-h-screen bg-[#0F172A] p-2 text-slate-100">
      <div className="grid min-h-[calc(100vh-16px)] w-full gap-3 rounded-2xl border border-[#0F62FE]/40 bg-gradient-to-b from-[#0f1b33] to-[#0b1424] p-3 shadow-[0_0_30px_rgba(15,98,254,0.25)] md:grid-cols-[190px_1fr]">
        <CyberSidebar user={user} onSignOut={signOut} activeItem="workspaces" workspaceLink="/workspaces" />

        <section className="rounded-xl border border-[#64748B]/20 bg-[#111f35] p-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#64748B]/20 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Workspace</p>
              <h1 className="text-xl font-semibold text-slate-100">{workspace?.originalName || `ID: ${workspaceId}`}</h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Status</p>
              <p className="text-sm font-semibold uppercase text-[#38BDF8]">{status?.status || "pending"}</p>
            </div>
          </header>

          {statusLoading ? (
            <div className="mt-6">
              <Loader label="Syncing workspace..." />
            </div>
          ) : null}

          {statusError || error ? (
            <p className="mt-4 rounded border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{statusError || error}</p>
          ) : null}

          {status && status.status !== "completed" ? (
            <div className="mt-6 rounded-lg border border-[#64748B]/25 bg-[#0F172A] p-5">
              <p className="text-sm font-semibold text-slate-100">{status.step || "Processing your paper..."}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1e293b]">
                <div className="h-full bg-[#0F62FE] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-[#94a3b8]">{progress}% completed</p>
              {status.status === "failed" ? (
                <p className="mt-3 text-xs text-rose-300">{status.errorMessage || "Processing failed. Please retry from dashboard."}</p>
              ) : null}
            </div>
          ) : null}

          {status?.status === "completed" && workspace ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <article className="rounded-lg border border-[#64748B]/25 bg-[#0F172A] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Document metrics</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#64748B]">Pages</p>
                    <p className="font-semibold text-slate-100">{workspace.pageCount ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#64748B]">Words</p>
                    <p className="font-semibold text-slate-100">{workspace.wordCount ?? "N/A"}</p>
                  </div>
                </div>
              </article>
              <article className="rounded-lg border border-[#64748B]/25 bg-[#0F172A] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Outputs</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li>Overview</li>
                  <li>Methodology</li>
                  <li>Results</li>
                  <li>Critical Analysis</li>
                  <li>Q&A Prep</li>
                </ul>
                <Button type="button" className="mt-4" disabled>
                  Full preview (next)
                </Button>
                <div className="mt-4 border-t border-[#64748B]/20 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Exports</p>
                  <Button
                    type="button"
                    className="mt-2"
                    disabled={!plan.allows("ppt")}
                    title={!plan.allows("ppt") ? PLAN_NUDGES.ppt : "Download PPT when pipeline exposes signed URLs."}
                  >
                    Download PPT
                  </Button>
                </div>
              </article>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

