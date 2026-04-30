export function RouteLoader({ label = "Loading..." }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-arxio-bg text-arxio-on-surface">
      <div className="inline-flex items-center gap-3 text-lg">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-arxio-on-surface border-r-transparent" />
        {label}
      </div>
    </main>
  );
}
