export function Loader({ label = "Loading...", compact = false }) {
  return (
    <div
      className={`inline-flex items-center rounded-md border border-[#64748B]/35 bg-[#0F172A]/80 text-[#c9d5ea] shadow-[0_0_14px_rgba(15,98,254,0.15)] ${
        compact ? "gap-2 px-2 py-1 text-[11px]" : "gap-2.5 px-3 py-1.5 text-xs"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${compact ? "h-3.5 w-3.5 border-[1.5px]" : "h-4 w-4 border-2"} animate-spin rounded-full border-[#38BDF8] border-r-transparent`}
        aria-hidden="true"
      />
      <span className="font-medium tracking-[0.08em] uppercase">{label}</span>
    </div>
  );
}
