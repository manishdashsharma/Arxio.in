import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../common/components";
import { listPlans } from "../../core/api/subscription-api";
import { usePlan } from "../../core/plan/use-plan";
import { tierRank } from "../../core/plan/tier";

function formatMoney(price, currency) {
  const n = Number(price);
  const c = (currency || "USD").toUpperCase();
  if (!n) return "Free";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-blue-500">
      <circle cx="7" cy="7" r="6" fill="#eff6ff" />
      <path d="M4.5 7l2 2 3-3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BillingPage() {
  const plan = usePlan();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const currentRank = tierRank(plan.tier);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await listPlans();
      setPlans(Array.isArray(data?.plans) ? data.plans : []);
    } catch (e) {
      setPlans([]);
      setLoadError(e instanceof Error ? e.message : "Could not load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto rounded-2xl border border-slate-200/60 bg-slate-50">

        {/* Header */}
        <header className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Plans &amp; Billing</h1>
              <p className="mt-0.5 text-xs text-slate-400">Choose the plan that fits your research needs</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-700">Current: {plan.displayName}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Error */}
          {loadError && (
            <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</p>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 h-80" />
              ))}
            </div>
          )}

          {/* Plan cards */}
          {!loading && plans.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => {
                const rank = tierRank(p.tier);
                const isCurrent = p.tier === plan.tier;
                const isUpgrade = rank > currentRank;

                return (
                  <article
                    key={p.tier}
                    className={`relative flex flex-col rounded-2xl border bg-white p-5 transition-all ${
                      p.highlight
                        ? "border-blue-400 shadow-lg shadow-blue-500/10"
                        : isCurrent
                        ? "border-emerald-300 shadow-sm"
                        : "border-slate-200 shadow-sm"
                    }`}
                  >
                    {/* Badges */}
                    {p.highlight && !isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-blue-200 bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 shadow-sm whitespace-nowrap">
                        Most Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm whitespace-nowrap">
                        Your Plan
                      </span>
                    )}

                    {/* Plan name & price */}
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{p.name}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-black tracking-tight text-slate-900">
                        {p.price === 0 ? "Free" : formatMoney(p.price, p.currency)}
                      </span>
                      {p.price > 0 && (
                        <span className="text-xs text-slate-400">/ mo</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">{p.tagline}</p>

                    {/* Features */}
                    <ul className="flex-1 space-y-2 mb-6">
                      {(p.features || []).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
                          <CheckIcon />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active plan
                      </div>
                    ) : isUpgrade ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/upgrade?plan=${p.tier}`)}
                        className={`w-full rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                          p.highlight
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        Upgrade to {p.name}
                      </button>
                    ) : (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-center text-[11px] text-slate-400">
                        Lower than current plan
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* FAQ / info strip */}
          {!loading && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Good to know</p>
              <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-500 leading-relaxed">
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Cancel anytime</p>
                  <p>No long-term commitments. Cancel your subscription before the next billing date and you will not be charged again.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Monthly limits reset</p>
                  <p>PDF uploads, research topics, and chat messages reset on the 1st of each calendar month.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Questions?</p>
                  <p>Email us at <a href="mailto:support@arxio.in" className="text-blue-600 hover:underline">support@arxio.in</a> and we will respond within 2 business days.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
  );
}
