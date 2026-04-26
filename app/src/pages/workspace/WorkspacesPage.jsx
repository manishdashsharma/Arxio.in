import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { listWorkspaces } from "../../core/api/dashboard-api";
import { CyberSidebar } from "../../features/dashboard/components/CyberSidebar";

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "N/A";
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status) {
  if (status === "completed") return "text-emerald-300 border-emerald-400/30 bg-emerald-500/10";
  if (status === "processing") return "text-sky-300 border-sky-400/30 bg-sky-500/10";
  if (status === "failed") return "text-rose-300 border-rose-400/30 bg-rose-500/10";
  return "text-amber-300 border-amber-400/30 bg-amber-500/10";
}

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, hasNextPage: false });

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
    <main className="min-h-screen bg-[#0F172A] p-2 text-slate-100">
      <div className="grid min-h-[calc(100vh-16px)] w-full gap-3 rounded-2xl border border-[#0F62FE]/40 bg-gradient-to-b from-[#0f1b33] to-[#0b1424] p-3 shadow-[0_0_30px_rgba(15,98,254,0.25)] md:grid-cols-[190px_1fr]">
        <CyberSidebar user={user} onSignOut={signOut} activeItem="workspaces" workspaceLink="/workspaces" />

        <section className="rounded-xl border border-[#64748B]/20 bg-[#111f35] p-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#64748B]/20 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Workspace Catalog</p>
              <h1 className="text-2xl font-semibold text-slate-100">All Workspaces</h1>
            </div>
            <p className="text-xs text-[#94a3b8]">
              Total {meta.total} · Page {meta.page} · Limit {meta.limit} · Has next: {meta.hasNextPage ? "Yes" : "No"}
            </p>
          </header>

          {loading ? (
            <div className="mt-6">
              <Loader label="Loading workspaces..." />
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="mt-6 text-sm text-[#94a3b8]">No workspace yet. Upload a PDF from dashboard to create one.</p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.workspaceId}
                  className="cursor-pointer rounded border border-[#64748B]/20 bg-[#16243d] p-4 transition hover:border-[#0F62FE]/45 hover:bg-[#1a2c49]"
                  onClick={() => navigate(`/workspace/${item.workspaceId}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-lg font-semibold text-slate-100">{item.originalName}</p>
                    <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[#64748B]">Pages</p>
                      <p className="text-sm font-semibold text-slate-200">{item.pageCount ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[#64748B]">Size</p>
                      <p className="text-sm font-semibold text-slate-200">{formatBytes(item.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[#64748B]">ID</p>
                      <p className="truncate text-sm font-semibold text-slate-200">{item.workspaceId}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

