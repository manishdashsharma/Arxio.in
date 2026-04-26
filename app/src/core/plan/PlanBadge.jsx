import { usePlan } from "./use-plan";

export function PlanBadge({ className = "" }) {
  const { displayName, tier, loading } = usePlan();
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-arxio-outline-variant/25 bg-arxio-surface-container/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-arxio-primary-container ${className}`}
      title={`Plan tier: ${tier}`}
    >
      {loading ? "…" : displayName}
    </span>
  );
}
