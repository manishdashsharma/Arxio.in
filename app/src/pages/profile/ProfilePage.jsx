import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { me } from "../../core/api/auth-api";
import { PlanStatusStrip } from "../../core/plan/PlanStatusStrip";
import { usePlan } from "../../core/plan/use-plan";

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
  const { user } = useAuth();
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
    <section className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg px-4 pb-10 pt-5 md:px-7">
      <header className="mb-6 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-blue-50/45 to-indigo-50/40 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.07)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Student Profile Hub</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Welcome back, {profileData?.name || "Learner"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review your account, monitor plan usage, and manage your security in one clean workspace.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refreshProfile}
            loading={loading}
            className="rounded-xl border-slate-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 hover:border-blue-300 hover:text-blue-700"
          >
            Refresh profile
          </Button>
        </div>
      </header>

      {error ? (
        <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!profileData ? (
        <Loader label="Loading profile..." />
      ) : (
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Account Details</h2>
                <p className="text-xs text-slate-500">Your primary identity information.</p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                Read only
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
              <div className="shrink-0">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-100 md:h-24 md:w-24" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-xl font-black text-blue-700 ring-2 ring-slate-100 md:h-24 md:w-24">
                    {initials(profileData.name)}
                  </div>
                )}
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Full Name</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{profileData.name || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Email Address</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{profileData.email || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Member Since</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{formatDate(profileData.created_at)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">User ID</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{String(profileData.id || "").slice(-8) || "—"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)] md:p-6">
            <PlanStatusStrip className="mb-5" upgradeLabel="Upgrade plan" />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-3">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Plan & Usage</h2>
                <p className="text-sm text-slate-600">
                  You are currently on the <span className="font-bold text-blue-700">{plan.displayName}</span> plan. Track your monthly PDF usage below.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>PDF usage</span>
                    <span>{plan.loading || !plan.quotasReady ? "…" : pdfLabel}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: pdfLimit === -1 ? "100%" : `${pdfPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Resets on {nextMonthlyResetLabel()}.</p>
                  {plan.error ? <p className="mt-2 text-xs font-medium text-amber-700">{plan.error}</p> : null}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">Billing preview</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Invoices</p>
                <p className="mt-1 text-xs text-slate-600">
                  Billing statements and payment history will appear here once enabled.
                </p>
                <Link
                  to="/billing"
                  className="mt-4 inline-flex rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Open billing page
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)] md:p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Security</h2>
              <p className="mt-1 text-xs text-slate-500">Recommended settings to protect your account.</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Multi-factor authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of protection while signing in.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={mfaPreviewOn}
                    onClick={() => setMfaPreviewOn((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${mfaPreviewOn ? "bg-blue-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${mfaPreviewOn ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">API access keys</p>
                      <p className="text-xs text-slate-500">Generate keys for integrations and automation.</p>
                    </div>
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/65 p-5 shadow-[0_12px_24px_rgba(244,63,94,0.08)] md:p-6">
              <h2 className="text-lg font-bold tracking-tight text-rose-700">Danger Zone</h2>
              <p className="mt-2 text-sm leading-relaxed text-rose-700/90">
                Account deletion is permanent. Your uploaded papers, generated analysis, and metadata will be removed and cannot be recovered.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">
                Secure verification required before this action is enabled.
              </p>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
