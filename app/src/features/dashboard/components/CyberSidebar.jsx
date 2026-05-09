import { NavLink, useNavigate } from "react-router-dom";
import { SIDEBAR_CONTENT } from "../../../core/ui/ui-content";
import { SIDEBAR_ITEM_KEY } from "../../../core/ui/ui-enums";

const ICONS = {
  grid: ({ cls }) => (
    <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
      <rect x="2" y="2" width="5" height="5" rx="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" />
    </svg>
  ),
  folder: ({ cls }) => (
    <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
      <path d="M1.5 4.5h4l1.2 1.4H14a.8.8 0 0 1 .8.8v5.8a1 1 0 0 1-1 1H2.2a1 1 0 0 1-1-1V5.3a.8.8 0 0 1 .3-.8z" />
    </svg>
  ),
  stack: ({ cls }) => (
    <svg viewBox="0 0 16 16" className={cls} fill="none">
      <path d="M8 1.5 14.5 4.2 8 7 1.5 4.2z" fill="currentColor" />
      <path d="M1.5 6.8 8 9.5l6.5-2.7M1.5 9.5 8 12.2l6.5-2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

function NavItem({ item, active, collapsed, workspaceLink }) {
  const to = item.key === SIDEBAR_ITEM_KEY.WORKSPACES ? (workspaceLink || item.to) : item.to;
  const Icon = ICONS[item.icon];
  const iconCls = `h-4 w-4 shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400"}`;

  if (collapsed) {
    return (
      <NavLink
        to={to}
        title={item.label}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
          active
            ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        {Icon && <Icon cls={iconCls} />}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-500" />
      )}
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${active ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"}`}>
        {Icon && <Icon cls={iconCls} />}
      </span>
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
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
  const navigate = useNavigate();
  const initial = String(user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <aside
      className={`flex h-full min-h-0 flex-col bg-white border border-slate-200/70 shadow-sm ${
        mobileMode ? "rounded-r-2xl rounded-l-none" : "rounded-2xl"
      } ${collapsed ? "px-2 py-3 items-center" : "px-3 py-3"}`}
    >
      {/* Brand row */}
      <div className={`mb-5 flex w-full items-center ${collapsed ? "flex-col gap-2" : "justify-between gap-2 px-1"}`}>
        {collapsed ? (
          <>
            <img src="/logo.svg" alt="Arxio" className="h-8 w-8 rounded-xl" />
            {onToggleCollapse && !mobileMode && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
                title="Expand sidebar"
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3 rotate-180" fill="none">
                  <path d="M9 3 5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.svg" alt="Arxio" className="h-7 w-7 shrink-0 rounded-xl" />
              <span className="text-[15px] font-black tracking-tight text-slate-900 truncate">Arxio</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onToggleCollapse && !mobileMode && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
                  title="Collapse sidebar"
                >
                  <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
                    <path d="M9 3 5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              {mobileMode && onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                  <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
                    <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "flex flex-col items-center gap-1" : "space-y-0.5"}`}>
        {!collapsed && (
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Menu</p>
        )}
        {SIDEBAR_CONTENT.ITEMS.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={item.key === activeItem}
            collapsed={collapsed}
            workspaceLink={workspaceLink}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className={`mt-auto pt-3 border-t border-slate-100 ${collapsed ? "flex flex-col items-center gap-1 w-full" : "space-y-1"}`}>
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              title={user?.name || "Profile"}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm transition hover:opacity-90"
            >
              {initial}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                {initial}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-semibold text-slate-800">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.plan || "Free"} plan</p>
              </div>
              <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-slate-300" fill="none">
                <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none">
                <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
