import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../core/auth/use-auth";
import { SIDEBAR_ITEM_KEY } from "../core/ui/ui-enums";
import { CyberSidebar } from "../features/dashboard/components/CyberSidebar";

const SIDEBAR_COLLAPSED_KEY = "arxio-sidebar-collapsed";

function activeItemFromPath(pathname) {
  if (pathname.startsWith("/profile")) return SIDEBAR_ITEM_KEY.PROFILE;
  if (pathname.startsWith("/billing")) return SIDEBAR_ITEM_KEY.BILLING;
  if (pathname.startsWith("/workspace") || pathname.startsWith("/workspaces")) return SIDEBAR_ITEM_KEY.WORKSPACES;
  return SIDEBAR_ITEM_KEY.DASHBOARD;
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const activeItem = activeItemFromPath(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (cached === "1") setSidebarCollapsed(true);
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      // ignore storage failures
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    function onKeyDown(event) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const wantsToggle = isMac ? event.metaKey && event.key.toLowerCase() === "b" : event.ctrlKey && event.key.toLowerCase() === "b";
      if (!wantsToggle) return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) return;
      event.preventDefault();
      setSidebarCollapsed((prev) => !prev);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-b from-arxio-bg to-white p-2 text-arxio-on-surface selection:bg-arxio-primary-container selection:text-white">
      <div className={`grid h-[calc(100vh-16px)] w-full gap-3 rounded-2xl border border-arxio-outline-variant/15 bg-arxio-surface-low p-3 transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "md:grid-cols-[88px_minmax(0,1fr)]" : "md:grid-cols-[250px_minmax(0,1fr)]"}`}>
        <div className="h-full min-w-0 shrink-0">
          <CyberSidebar
            user={user}
            onSignOut={signOut}
            activeItem={activeItem}
            workspaceLink="/workspaces"
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        </div>
        <div className="min-h-0 min-w-0 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
