import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Loader } from "../../common/components";
import { useAuth } from "../../core/auth/use-auth";
import { activatePlan, listPlans } from "../../core/api/subscription-api";
import { usePlan } from "../../core/plan/use-plan";
import { tierRank } from "../../core/plan/tier";

function formatMoney(price, currency) {
  const n = Number(price);
  const c = (currency || "USD").toUpperCase();
  if (!n) return "Free";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
  } catch {
    return `${c} ${n}`;
  }
}

export function BillingPage() {
  const { refreshUser } = useAuth();
  const plan = usePlan();
  const [plans, setPlans] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activateOpen, setActivateOpen] = useState(false);
  const [activateTier, setActivateTier] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateMessage, setActivateMessage] = useState("");
  const [activateError, setActivateError] = useState("");

  const currentRank = tierRank(plan.tier);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await listPlans();
      const list = Array.isArray(data?.plans) ? data.plans : [];
      setPlans(list);
    } catch (e) {
      setPlans([]);
      setLoadError(e instanceof Error ? e.message : "Could not load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function onActivateSubmit(e) {
    e.preventDefault();
    if (!activateTier) return;
    setActivateLoading(true);
    setActivateError("");
    setActivateMessage("");
    try {
      await activatePlan({ access_key: accessKey, plan: activateTier });
      setAccessKey("");
      setActivateMessage(`Plan updated to ${activateTier}.`);
      setActivateOpen(false);
      await refreshUser();
      await plan.refresh();
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : "Activation failed.");
    } finally {
      setActivateLoading(false);
    }
  }

  function openActivate(tier) {
    setActivateTier(tier);
    setActivateError("");
    setActivateMessage("");
    setActivateOpen(true);
  }

  return (
    <>
      <section className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-arxio-outline-variant/10 bg-arxio-bg px-3 pb-10 pt-4 sm:px-5 sm:pb-12 sm:pt-8 md:px-10">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-arxio-on-surface sm:text-3xl">Plans &amp; allocation</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-arxio-on-surface-variant">
                Compare tiers from your workspace catalog. Self-serve card checkout is not wired yet; your backend can
                still apply a tier using{" "}
                <code className="rounded bg-arxio-surface-container px-1 py-0.5 text-xs text-arxio-primary">POST /subscription/activate</code>{" "}
                with a server access key.
              </p>
            </div>
            <Link
              to="/profile"
              className="rounded-lg border border-arxio-outline-variant/30 bg-arxio-surface-container/40 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-arxio-on-surface transition hover:bg-arxio-surface-container-high sm:px-4 sm:text-xs"
            >
              Back to profile
            </Link>
          </header>

          <p className="mb-6 text-xs text-arxio-on-surface-variant">
            Current tier:{" "}
            <span className="font-bold text-arxio-tertiary">{plan.displayName}</span>
            {plan.isSubscribed ? <span className="text-arxio-on-surface-variant/70"> · Subscribed</span> : null}
          </p>

          {activateMessage ? (
            <p className="mb-4 rounded border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700" role="status">
              {activateMessage}
            </p>
          ) : null}

          {loadError ? (
            <p className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</p>
          ) : null}

          {loading ? (
            <Loader label="Loading plans..." />
          ) : (
            <div className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => {
                const rank = tierRank(p.tier);
                const isCurrent = p.tier === plan.tier;
                const isUpgrade = rank > currentRank;
                const isDowngrade = rank < currentRank;
                return (
                  <article
                    key={p.tier}
                    className={`arxio-glass flex flex-col rounded-xl border p-4 sm:p-5 ${
                      p.highlight ? "border-arxio-primary-container/50 ring-1 ring-arxio-primary-container/20" : "border-arxio-outline-variant/15"
                    } ${isCurrent ? "border-arxio-tertiary/40" : ""}`}
                  >
                    {p.highlight ? (
                      <span className="mb-2 inline-flex w-fit rounded-md bg-arxio-primary-container/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-arxio-primary-container">
                        Popular
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <span className="mb-2 inline-flex w-fit rounded-md bg-arxio-tertiary/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-arxio-tertiary">
                        Current
                      </span>
                    ) : null}
                    <h2 className="text-lg font-bold text-arxio-on-surface">{p.name}</h2>
                    <p className="mt-1 text-xs text-arxio-on-surface-variant">{p.tagline}</p>
                    <p className="mt-4 text-2xl font-black tracking-tight text-arxio-on-surface">
                      {formatMoney(p.price, p.currency)}
                      {p.price ? <span className="text-xs font-semibold text-arxio-on-surface-variant"> / {p.billing || "mo"}</span> : null}
                    </p>
                    <ul className="mt-4 flex-1 space-y-2 border-t border-arxio-outline-variant/10 pt-4 text-left text-[11px] text-arxio-on-surface-variant">
                      {(p.features || []).slice(0, 6).map((f) => (
                        <li key={f} className="leading-snug">
                          · {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5">
                      {isCurrent ? (
                        <p className="w-full rounded-lg border border-arxio-tertiary/30 bg-arxio-tertiary/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-arxio-tertiary">
                          Your plan
                        </p>
                      ) : isUpgrade ? (
                        <Button
                          type="button"
                          onClick={() => openActivate(p.tier)}
                          className="w-full rounded-lg bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary py-2 text-xs font-black uppercase tracking-widest text-white"
                        >
                          Upgrade
                        </Button>
                      ) : (
                        <p className="w-full rounded-lg border border-arxio-outline-variant/25 bg-arxio-surface-container/30 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-arxio-on-surface-variant/70">
                          Lower tier via support
                        </p>
                      )}
                      {isDowngrade && !isCurrent ? (
                        <p className="mt-2 text-[10px] text-arxio-on-surface-variant/60">Contact support to move to a lower tier.</p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {import.meta.env.DEV ? (
            <p className="mx-auto mt-8 max-w-6xl rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[10px] text-amber-700">
              Dev hint: use <strong>Upgrade</strong> on a higher tier and confirm with your server{" "}
              <code className="text-arxio-primary">SUBSCRIPTION_ACCESS_KEY</code> to call activate locally.
            </p>
          ) : null}
      </section>

      {activateOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activate-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivateOpen(false);
          }}
        >
          <div
            className="arxio-glass w-full max-w-md rounded-t-2xl border border-arxio-outline-variant/20 p-4 shadow-xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="activate-title" className="text-lg font-bold text-arxio-on-surface">
              Upgrade to {plans.find((x) => x.tier === activateTier)?.name || activateTier}
            </h2>
            {import.meta.env.DEV ? (
              <form className="mt-4 space-y-3" onSubmit={onActivateSubmit}>
                <p className="text-xs text-arxio-on-surface-variant">
                  Enter the server subscription access key (dev only). This calls <code className="text-arxio-primary">POST /subscription/activate</code>.
                </p>
                <input
                  type="password"
                  autoComplete="off"
                  value={accessKey}
                  onChange={(ev) => setAccessKey(ev.target.value)}
                  placeholder="Access key"
                  className="w-full rounded-sm border border-arxio-outline-variant/30 bg-arxio-surface-lowest px-3 py-2 text-sm text-arxio-on-surface"
                />
                {activateError ? <p className="text-xs text-red-600">{activateError}</p> : null}
                <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    className="rounded-lg border border-arxio-outline-variant/30 px-4 py-2 text-xs font-bold uppercase text-arxio-on-surface"
                    onClick={() => setActivateOpen(false)}
                  >
                    Cancel
                  </button>
                  <Button type="submit" loading={activateLoading} className="rounded-lg px-4 py-2 text-xs font-bold uppercase">
                    Confirm upgrade
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-arxio-on-surface-variant">
                  Self-serve paid upgrades are not enabled in this build. Ask your administrator to assign a plan, or use the
                  activation API from a trusted server environment.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="rounded-sm bg-arxio-primary-container px-4 py-2 text-xs font-bold uppercase text-white"
                    onClick={() => setActivateOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
