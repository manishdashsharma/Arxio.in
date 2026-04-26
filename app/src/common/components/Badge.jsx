import { cn } from "../utils/cn";

const variants = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  accent: "bg-blue-500/20 text-blue-200 border-blue-400/40",
  success: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
};

export function Badge({ children, variant = "default", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
