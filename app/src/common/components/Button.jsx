import { cn } from "../utils/cn";

const variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-400",
  secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
  outline: "border border-slate-500 bg-transparent text-slate-100 hover:bg-slate-800",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
};

export function Button({
  children,
  variant = "primary",
  className,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
