import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";
import { cn } from "../utils/cn";

const STATUS_STYLES = {
  [WORKSPACE_STATUS.COMPLETED]: "border-emerald-300 bg-emerald-50 text-emerald-700",
  [WORKSPACE_STATUS.PROCESSING]: "border-sky-300 bg-sky-50 text-sky-700",
  [WORKSPACE_STATUS.FAILED]: "border-rose-300 bg-rose-50 text-rose-700",
  [WORKSPACE_STATUS.PENDING]: "border-amber-300 bg-amber-50 text-amber-700",
};

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === WORKSPACE_STATUS.COMPLETED) return WORKSPACE_STATUS.COMPLETED;
  if (value === WORKSPACE_STATUS.PROCESSING) return WORKSPACE_STATUS.PROCESSING;
  if (value === WORKSPACE_STATUS.FAILED) return WORKSPACE_STATUS.FAILED;
  return WORKSPACE_STATUS.PENDING;
}

export function StatusTag({ status, className, short = false }) {
  const normalized = normalizeStatus(status);
  const label = short ? normalized.toUpperCase() : normalized;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
        STATUS_STYLES[normalized],
        className,
      )}
    >
      {label}
    </span>
  );
}
