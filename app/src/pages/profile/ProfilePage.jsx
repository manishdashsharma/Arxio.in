import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { me } from "../../core/api/auth-api";
import { usePlan } from "../../core/plan/use-plan";
import { CyberSidebar } from "../../features/dashboard/components/CyberSidebar";

function formatDate(iso) {
  if (!iso) return "N/A";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function nextMonthlyResetLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function pdfUsagePercent(used, limit) {
  if (limit === -1 || limit == null) return 0;
  const u = Number(used) || 0;
  const l = Number(limit) || 1;
  return Math.min(100, Math.round((u / l) * 100));
}

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const plan = usePlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(user);
  const [mfaPreviewOn, setMfaPreviewOn] = useState(false);

  const profileData = useMemo(() => profile || user, [profile, user]);

  async function refreshProfile() {
    setLoading(true);
    setError("");
    try {
      const fresh = await me();
      setProfile(fresh);
      await plan.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh profile.");
    } finally {
      setLoading(false);
    }
  }

  const pdfUsed = plan.usage?.pdfsUsed ?? 0;
  const pdfLimit = plan.limits?.pdfs_per_month;
  const pdfPct = plan.loading || !plan.quotasReady ? 0 : pdfUsagePercent(pdfUsed, pdfLimit);
  const pdfLabel =
    pdfLimit === -1 ? `${pdfUsed} / Unlimited` : `${pdfUsed} / ${pdfLimit} Used`;

  return (
    <main className="min-h-screen bg-arxio-bg p-2 text-arxio-on-surface selection:bg-arxio-primary-container selection:text-white">
      <div className="grid min-h-[calc(100vh-16px)] w-full gap-3 rounded-2xl border border-arxio-outline-variant/15 bg-arxio-surface-low p-3 md:grid-cols-[16rem_1fr]">
        <CyberSidebar user={profileData} onSignOut={signOut} activeItem="profile" workspaceLink="/workspaces" />

        <section className="flex min-h-0 flex-col overflow-y-auto rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg px-5 pb-12 pt-8 md:px-10">
          <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-arxio-on-surface">System Configuration</h1>
              <p className="mt-2 text-sm font-medium text-arxio-on-surface-variant">
                Manage your investigator profile and computational resources.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={refreshProfile}
              loading={loading}
              className="rounded-sm border-arxio-outline-variant/30 bg-arxio-surface-container/40 text-xs font-bold uppercase tracking-widest text-arxio-on-surface hover:bg-arxio-surface-container-high"
            >
              Sync
            </Button>
          </header>

          {error ? (
            <p className="mb-6 rounded border border-red-400/30 bg-red-950/25 px-4 py-2 text-sm text-red-200">{error}</p>
          ) : null}

          {!profileData ? (
            <Loader label="Loading profile..." />
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <section className="arxio-glass rounded-lg border border-arxio-outline-variant/15 p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-arxio-primary">Scholar Profile</h2>
                  <p className="mt-1 text-xs text-arxio-on-surface-variant">Update your administrative credentials.</p>
                </div>
                <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start">
                  <div className="shrink-0">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt=""
                        className="h-24 w-24 rounded-sm object-cover grayscale brightness-90"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-sm border border-arxio-outline-variant/20 bg-arxio-surface-container-lowest text-lg font-black tracking-tight text-arxio-primary">
                        {initials(profileData.name)}
                      </div>
                    )}
                  </div>
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-arxio-outline-variant" htmlFor="profile-name">
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        readOnly
                        value={profileData.name || ""}
                        className="w-full border-0 border-b-2 border-arxio-outline-variant bg-arxio-surface-lowest px-3 py-2 text-sm font-semibold text-arxio-on-surface focus:border-arxio-primary-container focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-tighter text-arxio-outline-variant" htmlFor="profile-email">
                        Email Address
                      </label>
                      <input
                        id="profile-email"
                        readOnly
                        value={profileData.email || ""}
                        className="w-full border-0 border-b-2 border-arxio-outline-variant bg-arxio-surface-lowest px-3 py-2 text-sm font-semibold text-arxio-on-surface focus:border-arxio-primary-container focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled
                    title="Profile editing is not available yet."
                    className="rounded-sm bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-6 py-2 text-xs font-bold uppercase tracking-widest text-white opacity-50"
                  >
                    Save Changes
                  </Button>
                </div>
              </section>

              <section className="arxio-glass rounded-lg border border-arxio-outline-variant/15 p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-arxio-primary">Resource Allocation</h2>
                      <p className="mt-1 text-xs text-arxio-on-surface-variant">
                        Currently operating on the{" "}
                        <span className="font-bold text-arxio-tertiary">{plan.displayName} Plan</span>.
                      </p>
                    </div>
                    <div className="max-w-md space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-arxio-on-surface-variant">
                        <span>PDF Intelligence Extraction</span>
                        <span>{plan.loading || !plan.quotasReady ? "…" : pdfLabel}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-arxio-surface-container-highest">
                        <div
                          className="h-full rounded-full bg-arxio-primary-container shadow-[0_0_10px_rgba(15,98,254,0.4)] transition-all duration-500"
                          style={{ width: pdfLimit === -1 ? "100%" : `${pdfPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] italic text-arxio-on-surface-variant/70">
                        Usage aligns with your subscription tier. Next monthly boundary: {nextMonthlyResetLabel()}.
                      </p>
                      {plan.error ? <p className="text-xs text-amber-200/90">{plan.error}</p> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 md:min-w-[10.5rem]">
                    <Link
                      to="/billing"
                      className="rounded-sm border border-arxio-outline-variant/30 bg-arxio-surface-container-highest px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-arxio-on-surface transition hover:bg-arxio-surface-container-high"
                    >
                      Upgrade Plan
                    </Link>
                    <button
                      type="button"
                      disabled
                      title="Invoices are not available in this build."
                      className="text-center text-[10px] font-bold uppercase tracking-widest text-arxio-primary opacity-60"
                    >
                      View Invoices
                    </button>
                  </div>
                </div>
                <dl className="mt-6 grid gap-4 border-t border-arxio-outline-variant/10 pt-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-tighter text-arxio-on-surface-variant">Research</dt>
                    <dd className="mt-1 text-sm font-semibold text-arxio-on-surface">
                      {plan.loading || !plan.quotasReady ? "…" : plan.formatResearchUsage()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-tighter text-arxio-on-surface-variant">Chat</dt>
                    <dd className="mt-1 text-sm font-semibold text-arxio-on-surface">
                      {plan.loading || !plan.quotasReady ? "…" : plan.formatChatUsage()}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-arxio-outline-variant/15 bg-arxio-surface-low/35 p-6 md:p-8">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-arxio-on-surface">Security & Auth</h2>
                <div className="space-y-0">
                  <div className="flex items-center justify-between gap-4 border-b border-arxio-outline-variant/10 py-4">
                    <div>
                      <p className="text-sm font-semibold text-arxio-on-surface">Multi-Factor Authentication</p>
                      <p className="text-xs text-arxio-on-surface-variant">Secure your vault with biometric verification.</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mfaPreviewOn}
                      onClick={() => setMfaPreviewOn((v) => !v)}
                      className={`relative h-5 w-10 shrink-0 rounded-full p-0.5 transition-colors ${mfaPreviewOn ? "bg-arxio-tertiary-container" : "bg-arxio-surface-container-highest"}`}
                    >
                      <span
                        className={`block h-3 w-3 rounded-full bg-white shadow transition-transform ${mfaPreviewOn ? "translate-x-5" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-arxio-on-surface">API Research Keys</p>
                      <p className="text-xs text-arxio-on-surface-variant">Generate keys for external data scraping.</p>
                    </div>
                    <button
                      type="button"
                      disabled
                      title="API key management is not available yet."
                      className="rounded-sm border border-arxio-outline-variant px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-arxio-on-surface-variant opacity-50"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-red-900/40 bg-red-950/15 p-6 md:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-red-900/35 text-xl text-red-200" aria-hidden="true">
                    !
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-red-300">Termination Zone</h2>
                    <p className="mt-2 text-xs leading-relaxed text-arxio-on-surface-variant">
                      Permanent account deletion. All research papers, annotations, and metadata will be purged from the
                      Arxio global index. This action is irreversible.
                    </p>
                    <Button
                      type="button"
                      disabled
                      title="Account deletion is not exposed by the API yet."
                      className="mt-6 rounded-sm border-0 bg-[#93000A] px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-white opacity-60 hover:brightness-125"
                    >
                      Delete Intelligence Profile
                    </Button>
                  </div>
                </div>
              </section>

              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-arxio-outline-variant/10 py-8 text-[10px] font-medium uppercase tracking-[0.2em] text-arxio-outline">
                <span>Operator ID: {String(profileData.id || "").slice(-8) || "—"}</span>
                <span>Joined {formatDate(profileData.created_at)}</span>
                <span className="text-arxio-on-surface-variant/60">Arxio Intelligence</span>
              </footer>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
