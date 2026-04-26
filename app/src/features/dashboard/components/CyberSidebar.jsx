import { Button } from "../../../common/components";
import { PlanBadge } from "../../../core/plan/PlanBadge";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "grid", to: "/dashboard" },
  { key: "workspaces", label: "Workspaces", icon: "folder", to: "/workspaces" },
  { key: "intake", label: "Data Intake", icon: "database", href: "/dashboard#upload" },
  { key: "analytics", label: "Analytics", icon: "trend", disabled: true },
  { key: "billing", label: "Plans", icon: "stack", to: "/billing" },
  { key: "profile", label: "Profile", icon: "gear", to: "/profile" },
];

function SidebarIcon({ type, active = false }) {
  const base = active ? "text-arxio-primary-container" : "text-arxio-on-surface-variant/70";
  if (type === "grid") {
    return (
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (type === "folder") {
    return (
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
        <path d="M1.5 4.5h4l1.2 1.4H14a.8.8 0 0 1 .8.8v5.8a1 1 0 0 1-1 1H2.2a1 1 0 0 1-1-1V5.3a.8.8 0 0 1 .3-.8z" fill="currentColor" />
      </svg>
    );
  }
  if (type === "database") {
    return (
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
        <ellipse cx="8" cy="3.5" rx="5.5" ry="2.2" fill="currentColor" />
        <path d="M2.5 6v2.2c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V6" fill="currentColor" />
        <path d="M2.5 10v2.2c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V10" fill="currentColor" />
      </svg>
    );
  }
  if (type === "trend") {
    return (
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
        <path d="M2 12.5l3.8-4.1 2.2 2.4 3.7-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.5 5.8h2.7V8.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "stack") {
    return (
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
        <path d="M8 1.5 14.5 4.2 8 7 1.5 4.2z" fill="currentColor" opacity="0.9" />
        <path d="M1.5 6.8 8 9.5l6.5-2.7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M1.5 9.5 8 12.2l6.5-2.7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${base}`} aria-hidden="true">
      <path d="M8 1.5l1.4 1.2 1.8-.1.8 1.7 1.6.9-.5 1.8 1 1.5-1 1.5.5 1.8-1.6.9-.8 1.7-1.8-.1L8 14.5l-1.4 1.2-1.8-.1-.8-1.7-1.6-.9.5-1.8-1-1.5 1-1.5-.5-1.8 1.6-.9.8-1.7 1.8.1z" fill="currentColor" />
      <circle cx="8" cy="8" r="2" fill="#0b1326" />
    </svg>
  );
}

function rowClasses(active) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium tracking-tight transition-colors duration-150 ${
    active
      ? "bg-arxio-surface-container text-arxio-primary-container font-semibold border-r-2 border-arxio-primary-container arxio-active-tab-glow"
      : "text-arxio-on-surface-variant/80 hover:bg-arxio-surface-container/50 hover:text-arxio-on-surface"
  }`;
}

export function CyberSidebar({ user, onSignOut, activeItem = "dashboard", workspaceLink = "" }) {
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border border-arxio-outline-variant/15 bg-arxio-surface-lowest px-3 py-6">
      <div className="mb-8 px-0.5">
        <p className="text-lg font-bold tracking-tighter text-arxio-primary-container uppercase">Arxio Intelligence</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-medium uppercase tracking-tight text-arxio-on-surface-variant/50">
            Terminal Access: Alpha-9
          </p>
          <PlanBadge />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const to = item.key === "workspaces" ? (workspaceLink || null) : item.to;
          const active = item.key === activeItem;
          const content = (
            <>
              <SidebarIcon type={item.icon} active={active} />
              {item.label}
            </>
          );
          if (to) {
            return (
              <NavLink
                key={item.key}
                to={to}
                className={({ isActive }) => rowClasses(isActive || active)}
              >
                {content}
              </NavLink>
            );
          }
          if (item.href && !item.disabled) {
            return (
              <a
                key={item.key}
                href={item.href}
                className={rowClasses(active)}
              >
                {content}
              </a>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              className={`${rowClasses(active)} ${item.disabled ? "cursor-not-allowed opacity-60 hover:bg-transparent" : ""}`}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-arxio-surface-container/20 pt-6 text-xs text-arxio-on-surface-variant/70">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-arxio-on-surface-variant/80 transition-colors hover:text-arxio-on-surface"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] opacity-80">i</span>
          Documentation
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-arxio-on-surface-variant/80 transition-colors hover:text-arxio-on-surface"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] opacity-80">?</span>
          Support
        </button>
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-arxio-surface-container/20 bg-arxio-surface-container/40 p-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-arxio-surface-container-highest text-[11px] text-arxio-on-surface-variant">
            👤
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-tight text-arxio-on-surface">
              {user?.name || "Operator"}
            </p>
            <p className="truncate text-[9px] font-bold uppercase tracking-widest text-arxio-on-surface-variant/50">
              Chief Researcher
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onSignOut}
          type="button"
          className="mt-2 w-full border-arxio-outline-variant/25 bg-transparent py-2 text-[11px] text-arxio-on-surface-variant hover:bg-arxio-surface-container/30 hover:text-arxio-on-surface"
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}

