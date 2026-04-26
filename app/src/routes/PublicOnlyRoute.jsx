import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/use-auth";

export function PublicOnlyRoute() {
  const { ready, user } = useAuth();
  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="inline-flex items-center gap-3 text-lg">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-r-transparent" />
          Loading workspace...
        </div>
      </main>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
