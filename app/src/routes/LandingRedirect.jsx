import { useEffect } from "react";

function resolveLandingUrl() {
  const configured = (import.meta.env.VITE_LANDING_URL || "").trim();
  if (configured) return configured;
  if (import.meta.env.DEV) return "http://localhost:3000";
  return "https://arxio.in";
}

export function LandingRedirect() {
  useEffect(() => {
    window.location.replace(resolveLandingUrl());
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-arxio-bg text-arxio-on-surface">
      <p className="text-sm text-arxio-on-surface-variant">Redirecting to landing page...</p>
    </main>
  );
}
