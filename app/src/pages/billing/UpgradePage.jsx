import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader } from "../../common/components";
import { listPlans, activatePlan } from "../../core/api/subscription-api";
import { useAuth } from "../../core/auth/use-auth";
import { usePlan } from "../../core/plan/use-plan";

function formatMoney(price, currency) {
  const n = Number(price);
  if (!n) return "Free";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: (currency || "USD").toUpperCase(), maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}

const TIER_META = {
  free:    { label: "Free",    accent: "#64748b", bg: "bg-slate-600",   ring: "ring-slate-200" },
  student: { label: "Student", accent: "#2563eb", bg: "bg-blue-600",    ring: "ring-blue-200"  },
  pro:     { label: "Pro",     accent: "#7c3aed", bg: "bg-violet-600",  ring: "ring-violet-200"},
  scholar: { label: "Scholar", accent: "#0f172a", bg: "bg-slate-900",   ring: "ring-slate-300" },
};

function CheckIcon({ accent }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 mt-0.5">
      <circle cx="7.5" cy="7.5" r="7" fill={accent + "18"} stroke={accent + "40"} strokeWidth="1"/>
      <path d="M4.5 7.5l2.5 2.5 4-4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function UpgradePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const plan = usePlan();
  const targetTier = params.get("plan") || "student";
  const meta = TIER_META[targetTier] || TIER_META.student;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listPlans();
      setPlans(Array.isArray(data?.plans) ? data.plans : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const targetPlan = plans.find(p => p.tier === targetTier);

  async function onActivate(e) {
    e.preventDefault();
    if (!coupon.trim()) return;
    setActivating(true);
    setError("");
    try {
      await activatePlan({ access_key: coupon.trim(), plan: targetTier });
      await refreshUser();
      await plan.refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setActivating(false);
    }
  }

  if (success) {
    return (
      <section className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-slate-200/60 bg-white">
        <div className="w-full max-w-sm text-center px-6">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">You are all set</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Welcome to <span className="font-bold text-slate-800">{targetPlan?.name || targetTier}</span>. Your new features are active right now.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Go to dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50">

      {/* Header */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-3.5 flex items-center gap-2">
        <Link to="/billing" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4.5 6l3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Plans
        </Link>
        <span className="text-slate-300 text-xs">/</span>
        <h1 className="text-sm font-bold text-slate-900">Upgrade</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader label="Loading..." />
          </div>
        ) : !targetPlan ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500 mb-3">Plan not found.</p>
            <Link to="/billing" className="text-xs font-semibold text-blue-600 hover:underline">Back to plans</Link>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-5 py-10">

            {/* Plan badge */}
            <div className="mb-8 text-center">
              <span className={`inline-flex items-center gap-2 rounded-full ${meta.bg} px-4 py-1.5 text-xs font-bold text-white shadow-sm`}>
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                {targetPlan.name} plan
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                {formatMoney(targetPlan.price, targetPlan.currency)}
                {targetPlan.price > 0 && <span className="text-base font-semibold text-slate-400 ml-1">/ month</span>}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{targetPlan.tagline}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_300px]">

              {/* LEFT — What's included */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">What you get</p>
                <ul className="space-y-3">
                  {(targetPlan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                      <CheckIcon accent={meta.accent} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* RIGHT — Checkout */}
              <div className="space-y-3">

                {/* Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Order summary</p>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">{targetPlan.name}</span>
                    <span className="text-sm font-bold text-slate-900">{formatMoney(targetPlan.price, targetPlan.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm font-semibold text-slate-700">Due today</span>
                    <span className="text-lg font-black text-slate-900">{formatMoney(targetPlan.price, targetPlan.currency)}</span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">Billed monthly · Cancel anytime</p>
                </div>

                {/* Payment */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">

                  {/* Stripe button — coming soon */}
                  <div className="relative">
                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 opacity-60 cursor-not-allowed select-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 shrink-0">
                        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2"/>
                        <rect x="3" y="9" width="4" height="1.2" rx="0.6" fill="currentColor" opacity="0.5"/>
                      </svg>
                      <span className="text-sm font-semibold text-slate-400 flex-1">Pay with card</span>
                      <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Soon
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Coupon */}
                  <button
                    type="button"
                    onClick={() => { setCouponOpen(v => !v); setError(""); }}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-slate-400">
                        <rect x="1" y="4" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M4.5 4V3a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                        <circle cx="6.5" cy="7.5" r="0.8" fill="currentColor"/>
                      </svg>
                      Have an early access code?
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`text-slate-400 transition-transform ${couponOpen ? "rotate-180" : ""}`}>
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {couponOpen && (
                    <form onSubmit={onActivate} className="space-y-2.5">
                      <input
                        type="password"
                        autoComplete="off"
                        value={coupon}
                        onChange={(e) => { setCoupon(e.target.value); setError(""); }}
                        placeholder="Enter your code"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none transition"
                      />
                      {error && (
                        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
                      )}
                      <button
                        type="submit"
                        disabled={!coupon.trim() || activating}
                        className="w-full rounded-xl py-2.5 text-xs font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: activating ? "#94a3b8" : meta.accent }}
                      >
                        {activating ? "Activating..." : "Activate plan"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Trust */}
                <div className="flex items-center justify-center gap-6">
                  {["Secure", "Cancel anytime", "Support"].map((label) => (
                    <span key={label} className="text-[9px] font-semibold uppercase tracking-wider text-slate-300">{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
