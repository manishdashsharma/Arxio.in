import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RouteLoader } from "./RouteLoader";
import { AppShell } from "./AppShell";

const SignInPage = lazy(() => import("../pages/auth/SignInPage").then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const BillingPage = lazy(() => import("../pages/billing/BillingPage").then((m) => ({ default: m.BillingPage })));
const UpgradePage = lazy(() => import("../pages/billing/UpgradePage").then((m) => ({ default: m.UpgradePage })));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const WorkspacePage = lazy(() => import("../pages/workspace/WorkspacePage").then((m) => ({ default: m.WorkspacePage })));
const WorkspacesPage = lazy(() => import("../pages/workspace/WorkspacesPage").then((m) => ({ default: m.WorkspacesPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader label="Loading page..." />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="/workspaces" element={<WorkspacesPage />} />
            <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Suspense>
  );
}
