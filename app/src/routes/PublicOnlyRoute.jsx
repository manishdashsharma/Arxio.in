import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/use-auth";
import { RouteLoader } from "./RouteLoader";

export function PublicOnlyRoute() {
  const { ready, user } = useAuth();
  if (!ready) {
    return <RouteLoader label="Loading workspace..." />;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
