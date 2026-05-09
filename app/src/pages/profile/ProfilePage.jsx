import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { me } from "../../core/api/auth-api";
import { usePlan } from "../../core/plan/use-plan";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function nextReset() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UsageStat({ label, used, limit, color = "bg-blue-500" }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 100 : Math.min(100, Math.round((used / (limit || 1)) * 100));
  const warn = !isUnlimited && pct > 85;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-600">{label}</span>
        <span className="text-[11px] font-semibold text-slate-500">
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${warn ? "bg-rose-500" : color}`}
          style={{ width: isUnlimited ? "30%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

const PLAN_COLORS = {
  free: "from-slate-100 to-slate-200 text-slate-600",
  student: "from-blue-500 to-indigo-600 text-white",
  pro: "from-violet-500 to-purple-600 text-white",
  scholar: "from-amber-400 to-orange-500 text-white",
};

export function ProfilePage() {
  const { user } = useAuth();
  const plan = usePlan();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(user);

  const data = useMemo(() => profile || user, [profile, user]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const fresh = await me();
      setProfile(fresh);
      await plan.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh.");
    } finally {
      setLoading(false);
    }
  }

  const pdfUsed = plan.usage?.pdfsUsed ?? 0;
  const pdfLimit = plan.limits?.pdfs_per_month;
  const planGradient = PLAN_COLORS[plan.tier] || PLAN_COLORS.free;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50">

      {/* Sticky header */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Account</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your profile and subscription</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={loading ? "animate-spin" : ""}>
            <path d="M10 6A4 4 0 1 1 6 2M10 2v4H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sync
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!data ? (
          <div className="flex h-full items-center justify-center"><Loader label="Loading..." /></div>
        ) : (
          <>
            {/* Identity card */}
            <div className="mx-5 mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-lg font-black text-blue-600">
                  {initials(data.name)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-900 truncate">{data.name || "—"}</p>
                <p className="text-xs text-slate-400 truncate">{data.email || "—"}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Member since {formatDate(data.created_at)}</p>
                <div className="mt-1.5">
                  {data.is_verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Email verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Not verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-5 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>
            )}

            <div className="px-5 pb-5 pt-3 space-y-4">

              {/* Plan card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`bg-linear-to-r ${planGradient} px-5 py-4 flex items-center justify-between gap-3`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Current plan</p>
                    <p className="text-xl font-black tracking-tight">{plan.displayName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="shrink-0 rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/30"
                  >
                    {plan.tier === "free" ? "Upgrade →" : "Manage"}
                  </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold">Monthly usage</span>
                    <span>Resets {nextReset()}</span>
                  </div>

                  <UsageStat
                    label="PDF uploads"
                    used={pdfUsed}
                    limit={pdfLimit}
                    color="bg-blue-500"
                  />
                  <UsageStat
                    label="Research topics"
                    used={plan.usage?.researchUsed ?? 0}
                    limit={plan.limits?.research_per_month}
                    color="bg-violet-500"
                  />
                  <UsageStat
                    label="Chat messages"
                    used={plan.usage?.chatUsed ?? 0}
                    limit={plan.limits?.chat_messages}
                    color="bg-emerald-500"
                  />

                  {plan.limits?.history_days !== undefined && (
                    <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400 shrink-0">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[11px] text-slate-500">
                        History retention:{" "}
                        <span className="font-bold text-slate-700">
                          {plan.limits.history_days === -1 ? "Forever" : `${plan.limits.history_days} days`}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Security</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    {
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      ),
                      label: "Password",
                      sub: "Change your login password",
                    },
                    {
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.4.6 3.5L8 10l-3.1 1.4.6-3.5L3 5.5 6.5 5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                      ),
                      label: "Two-factor authentication",
                      sub: "Protect your account with 2FA",
                    },
                  ].map(({ icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-4 px-5 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400">
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-[11px] text-slate-400">{sub}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-400">Soon</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-rose-100">
                  <p className="text-sm font-bold text-rose-600">Danger zone</p>
                </div>
                <div className="flex items-start gap-4 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-400">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Delete account</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                      Permanently removes your account and all data. Email{" "}
                      <a href="mailto:support@arxio.in" className="text-rose-500 hover:underline font-medium">support@arxio.in</a>{" "}
                      to request deletion.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </section>
  );
}
