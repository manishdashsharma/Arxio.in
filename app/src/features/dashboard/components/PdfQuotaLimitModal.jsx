export function PdfQuotaLimitModal({
  open,
  title = "PDF quota reached",
  description,
  pdfUsageDisplay,
  onDismiss,
  onUpgradePlan,
  onOpenProfile,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pdf-quota-modal-title"
      aria-describedby="pdf-quota-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className="arxio-glass relative w-full max-w-md overflow-hidden rounded-xl border border-amber-500/35 px-6 py-6 text-center shadow-[0_0_50px_rgba(15,98,254,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-2xl text-amber-200">
          !
        </div>
        <p id="pdf-quota-modal-title" className="mt-4 text-lg font-black uppercase tracking-tight text-arxio-on-surface">
          {title}
        </p>
        <p id="pdf-quota-modal-desc" className="mt-2 text-sm leading-relaxed text-arxio-on-surface-variant">
          {description}
        </p>
        <p className="mt-3 text-2xl font-black tracking-tight text-arxio-primary-container">{pdfUsageDisplay}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-arxio-on-surface-variant/70">
          Billing period usage
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            className="order-1 w-full rounded-sm bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:brightness-110 sm:order-none sm:w-auto"
            onClick={() => {
              onDismiss();
              onUpgradePlan();
            }}
          >
            Upgrade plan
          </button>
          <button
            type="button"
            className="order-2 rounded-sm border border-arxio-primary-container/40 bg-arxio-primary-container/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-arxio-primary-container transition hover:bg-arxio-primary-container/20 sm:order-none"
            onClick={() => {
              onDismiss();
              onOpenProfile();
            }}
          >
            Open profile
          </button>
          <button
            type="button"
            className="order-3 rounded-sm border border-arxio-outline-variant/30 bg-arxio-surface-container px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-arxio-on-surface transition hover:bg-arxio-surface-container-high sm:order-none"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
