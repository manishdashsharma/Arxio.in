import { Button } from "../../../common/components";
import { NavLink } from "react-router-dom";
import { SIDEBAR_CONTENT } from "../../../core/ui/ui-content";
import { SIDEBAR_ITEM_KEY } from "../../../core/ui/ui-enums";

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
      <circle cx="8" cy="8" r="2" fill="#f8fafc" />
    </svg>
  );
}

function rowClasses(active, collapsed) {
  return `group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${collapsed ? "justify-center" : "gap-2.5"} ${
    active
      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-arxio-primary-container shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]"
      : "text-arxio-on-surface-variant/80 hover:translate-x-0.5 hover:bg-slate-100/80 hover:text-arxio-on-surface"
  }`;
}

export function CyberSidebar({
  user,
  onSignOut,
  activeItem = "dashboard",
  workspaceLink = "",
  collapsed = false,
  onToggleCollapse,
  mobileMode = false,
}) {
  return (
    <aside className={`flex h-full min-h-0 flex-col border border-slate-200/80 bg-white px-3 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.08)] ${mobileMode ? "rounded-r-2xl rounded-l-none" : "rounded-2xl"}`}>
      <div className="mb-5">
        <div className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/35 to-indigo-50/45 p-3 ${collapsed ? "px-2.5" : "px-3.5"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
            <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
              <p className="truncate text-lg font-black tracking-tight text-slate-900">{SIDEBAR_CONTENT.BRAND_TITLE}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Smart student cockpit
              </p>
            </div>
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-sm ${collapsed ? "" : "mr-auto ml-0.5"}`}>
              ✦
            </span>
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                aria-label={mobileMode ? "Close sidebar" : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
                title={mobileMode ? "Close sidebar" : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              >
                {mobileMode ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M10.5 3.5 6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ) : null}
          </div>
          {!collapsed ? (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Focus. Build. Present.
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {!collapsed ? (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Main Menu</p>
        ) : null}
        {SIDEBAR_CONTENT.ITEMS.map((item) => {
          const to = item.key === SIDEBAR_ITEM_KEY.WORKSPACES ? (workspaceLink || null) : item.to;
          const active = item.key === activeItem;
          const content = collapsed ? (
            <span className="inline-flex w-full items-center justify-center">
              <SidebarIcon type={item.icon} active={active} />
            </span>
          ) : (
            <>
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  active ? "border-blue-200 bg-blue-50/80" : "border-slate-200 bg-white"
                }`}
              >
                <SidebarIcon type={item.icon} active={active} />
              </span>
              <span className="truncate">{item.label}</span>
              {item.key === SIDEBAR_ITEM_KEY.INTAKE ? (
                <span className="ml-auto rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                  New
                </span>
              ) : null}
            </>
          );
          if (to) {
            return (
              <NavLink
                key={item.key}
                to={to}
                className={({ isActive }) => rowClasses(isActive || active, collapsed)}
                title={collapsed ? item.label : undefined}
              >
                {active ? (
                  <>
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
                    {collapsed ? <span className="absolute -right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" /> : null}
                  </>
                ) : null}
                {content}
              </NavLink>
            );
          }
          if (item.href && !item.disabled) {
            return (
              <a
                key={item.key}
                href={item.href}
                className={rowClasses(active, collapsed)}
                title={collapsed ? item.label : undefined}
              >
                {active ? (
                  <>
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
                    {collapsed ? <span className="absolute -right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" /> : null}
                  </>
                ) : null}
                {content}
              </a>
            );
          }
          return null;
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-200 pt-5 text-xs text-arxio-on-surface-variant/70">
        {!collapsed ? (
          <p className="px-1 text-[10px] font-semibold text-slate-400">Shortcut: Cmd/Ctrl + B</p>
        ) : null}
        <div className={`flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-3 ${collapsed ? "justify-center" : "gap-3"}`}>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[11px] font-bold text-slate-600 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.22)]">
            {String(user?.name || SIDEBAR_CONTENT.USER_FALLBACK_NAME).trim().charAt(0).toUpperCase() || "U"}
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-tight text-slate-900">
                {user?.name || SIDEBAR_CONTENT.USER_FALLBACK_NAME}
              </p>
              <p className="truncate text-[10px] font-semibold text-slate-500">
                {SIDEBAR_CONTENT.USER_ROLE_LABEL} plan
              </p>
            </div>
          ) : null}
        </div>
        <Button
          variant="outline"
          onClick={onSignOut}
          type="button"
          className="mt-1 w-full border-slate-200 bg-white py-2 text-[11px] text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title={collapsed ? SIDEBAR_CONTENT.SIGN_OUT_LABEL : undefined}
        >
          {collapsed ? "⎋" : SIDEBAR_CONTENT.SIGN_OUT_LABEL}
        </Button>
      </div>
    </aside>
  );
}

