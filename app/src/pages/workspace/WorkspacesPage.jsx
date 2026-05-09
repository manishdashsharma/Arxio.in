import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, StatusTag } from "../../common/components";
import { listWorkspaces } from "../../core/api/dashboard-api";
import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "—";
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function cleanName(raw) {
  if (!raw) return "Untitled";
  return raw.replace(/\.pdf$/i, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect width="20" height="20" rx="5" fill="#eff6ff" />
      <path d="M6 4h5.5L14 6.5V16H6V4z" stroke="#2563eb" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M11 4v3h3" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h4M8 12.5h2.5" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
        <div className="flex-1">
          <div className="mb-1.5 h-3.5 w-3/4 rounded bg-slate-100" />
          <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        </div>
        <div className="h-5 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="flex gap-4">
        <div className="h-2.5 w-12 rounded bg-slate-100" />
        <div className="h-2.5 w-12 rounded bg-slate-100" />
        <div className="h-2.5 w-16 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function WorkspacesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, hasNextPage: false });
  const [search, setSearch] = useState("");

  const completedCount = items.filter((w) => w.status === WORKSPACE_STATUS.COMPLETED).length;
  const processingCount = items.filter(
    (w) => w.status === WORKSPACE_STATUS.PROCESSING || w.status === WORKSPACE_STATUS.PENDING,
  ).length;

  const filtered = search.trim()
    ? items.filter((w) => cleanName(w.originalName).toLowerCase().includes(search.toLowerCase()))
    : items;

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
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50">

      {/* Header */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">My Library</h1>
            <p className="mt-0.5 text-xs text-slate-400">All your uploaded research papers</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Upload paper
          </button>
        </div>

        {/* Stats + Search */}
        {!loading && items.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                {meta.total} total
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                {completedCount} done
              </span>
              {processingCount > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                  {processingCount} processing
                </span>
              )}
            </div>
            <div className="relative">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search papers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white transition w-44"
              />
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M8 4h9l5 5v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <path d="M17 4v6h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 15h8M10 19h5" stroke="#cbd5e1" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No papers yet</p>
            <p className="mt-1 text-xs text-slate-400">Upload your first research paper to get started</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Upload your first paper
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">No results for "{search}"</p>
            <button type="button" onClick={() => setSearch("")} className="mt-2 text-xs text-blue-600 hover:underline">
              Clear search
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const isCompleted = item.status === WORKSPACE_STATUS.COMPLETED;
              const name = cleanName(item.originalName);
              return (
                <article
                  key={item.workspaceId}
                  onClick={() => navigate(`/workspace/${item.workspaceId}`)}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                        <PdfIcon />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                          {name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.originalName}</p>
                      </div>
                    </div>
                    <StatusTag status={item.status} short className="shrink-0 text-[10px]" />
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M3.5 4.5h5M3.5 6.5h3.5M3.5 8.5h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      {item.pageCount ?? "—"} pages
                    </span>
                    <span className="text-slate-200">·</span>
                    <span>{formatBytes(item.fileSize)}</span>
                    <span className="text-slate-200">·</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                      Open workspace →
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M3.5 6l2 2 3-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Ready
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && meta.hasNextPage && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
