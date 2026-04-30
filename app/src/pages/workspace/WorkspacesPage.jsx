import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, StatusTag } from "../../common/components";
import { listWorkspaces } from "../../core/api/dashboard-api";
import { WORKSPACES_COPY } from "../../core/ui/ui-content";
import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "N/A";
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function WorkspacesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, hasNextPage: false });
  const completedCount = items.filter((item) => item.status === WORKSPACE_STATUS.COMPLETED).length;
  const processingCount = items.filter((item) => item.status === WORKSPACE_STATUS.PROCESSING || item.status === WORKSPACE_STATUS.PENDING).length;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listWorkspaces(1, 20);
        if (cancelled) return;
        setItems(data?.items || []);
        setMeta({
          total: data?.pagination?.total || 0,
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || 20,
          hasNextPage: Boolean(data?.pagination?.hasNextPage),
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load workspaces.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-arxio-outline-variant/20 bg-white p-3 shadow-sm sm:p-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-arxio-outline-variant/20 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-arxio-on-surface-variant/70">{WORKSPACES_COPY.CATALOG_KICKER}</p>
              <h1 className="text-2xl font-semibold text-arxio-on-surface">{WORKSPACES_COPY.CATALOG_TITLE}</h1>
            </div>
            <p className="text-xs text-arxio-on-surface-variant">
              Total {meta.total} · Page {meta.page} · Limit {meta.limit} · Has next: {meta.hasNextPage ? "Yes" : "No"}
            </p>
          </header>

          <div className="relative mt-4 overflow-hidden rounded-2xl border border-arxio-outline-variant/20 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 px-4 py-4 sm:px-5 sm:py-5">
            <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">{WORKSPACES_COPY.HERO_KICKER}</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{WORKSPACES_COPY.HERO_TITLE}</h2>
              <p className="mt-1 text-sm text-slate-600">{WORKSPACES_COPY.HERO_SUBTITLE}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                  {meta.total} Total
                </span>
                <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                  {completedCount} Completed
                </span>
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                  {processingCount} In Progress
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6">
              <Loader label="Loading workspaces..." />
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="mt-6 text-sm text-arxio-on-surface-variant">{WORKSPACES_COPY.EMPTY_STATE}</p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.workspaceId}
                  className="group cursor-pointer rounded-2xl border border-arxio-outline-variant/20 bg-white p-4 transition hover:-translate-y-0.5 hover:border-arxio-primary-container/45 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
                  onClick={() => navigate(`/workspace/${item.workspaceId}`)}
                >
                  <span className="pointer-events-none absolute" />
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-lg font-semibold text-arxio-on-surface group-hover:text-blue-700">{item.originalName}</p>
                    <StatusTag status={item.status} className="rounded-sm px-2 py-0.5 tracking-[0.12em]" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-arxio-on-surface-variant/65">Pages</p>
                      <p className="text-sm font-semibold text-arxio-on-surface">{item.pageCount ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-arxio-on-surface-variant/65">Size</p>
                      <p className="text-sm font-semibold text-arxio-on-surface">{formatBytes(item.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-arxio-on-surface-variant/65">ID</p>
                      <p className="truncate text-sm font-semibold text-arxio-on-surface">{item.workspaceId}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-arxio-outline-variant/15 pt-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                      {WORKSPACES_COPY.OPEN_WORKSPACE_LABEL}
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
    </section>
  );
}

