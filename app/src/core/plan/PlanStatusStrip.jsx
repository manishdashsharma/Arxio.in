import { useNavigate } from "react-router-dom";
import { usePlan } from "./use-plan";

export function PlanStatusStrip({ className = "", onUpgrade, upgradeLabel = "Upgrade" }) {
  const navigate = useNavigate();
  const plan = usePlan();

  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") {
      onUpgrade();
      return;
    }
    navigate("/billing");
  };

  const chips = [
    { label: "PDF", value: plan.loading ? "…" : plan.formatPdfUsage() },
    { label: "Research", value: plan.loading ? "…" : plan.formatResearchUsage() },
    { label: "Chat", value: plan.loading ? "…" : plan.formatChatUsage() },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-arxio-outline-variant/20 bg-arxio-surface-container/40 px-3 py-2 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-arxio-primary-container/35 bg-arxio-primary-container/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-arxio-primary">
          {plan.loading ? "…" : plan.displayName}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="rounded-md border border-arxio-outline-variant/25 bg-arxio-bg/50 px-2 py-1 text-[10px] font-semibold tracking-wide text-arxio-on-surface-variant"
              title={`${chip.label} usage`}
            >
              {chip.label} {chip.value}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="rounded-md bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white transition hover:brightness-110"
        onClick={handleUpgrade}
      >
        {upgradeLabel}
      </button>
    </div>
  );
}
