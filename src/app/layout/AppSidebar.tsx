import { NavLink } from "react-router-dom";
import { useLocale } from "../i18n/LocaleProvider";
import { useAuth } from "../../features/auth/AuthProvider";
import { LocaleSwitch } from "./LocaleSwitch";

const navItems = [
  { to: "/", end: true, key: "cockpit" as const, icon: "⌂" },
  { to: "/today", end: false, key: "today" as const, icon: "◷" },
  { to: "/diagnostic", end: false, key: "diagnostic" as const, icon: "◎" },
  { to: "/readiness", end: false, key: "readiness" as const, icon: "▤" },
  { to: "/analytics", end: false, key: "analytics" as const, icon: "↗" },
  { to: "/remediation", end: false, key: "remediation" as const, icon: "⚡" },
  { to: "/data", end: false, key: "data" as const, icon: "⬡" },
];

export function AppSidebar() {
  const { t } = useLocale();
  const { logout } = useAuth();

  return (
    <aside className="flex w-[13.5rem] shrink-0 flex-col border-r border-neon-blue/15 bg-panel/50 backdrop-blur-md">
      <div className="border-b border-neon-blue/10 px-4 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neon-cyan/80">{t.brand}</p>
        <p className="text-sm font-semibold text-accent">{t.brandSub}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3" aria-label="Main">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "border border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan shadow-neon-sm"
                  : "border border-transparent text-muted hover:border-neon-blue/15 hover:bg-neon-blue/5 hover:text-accent"
              }`
            }
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neon-blue/20 bg-neon-blue/5 text-sm">
              {item.icon}
            </span>
            {t.nav[item.key]}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-neon-blue/10 px-3 py-4">
        <NavLink
          to="/diagnostic/light"
          className="flex flex-col rounded-lg border border-neon-cyan/40 bg-gradient-to-br from-neon-blue/20 to-neon-cyan/10 px-3 py-2.5 shadow-neon-sm transition hover:border-neon-cyan/60 hover:brightness-110"
        >
          <span className="text-xs font-semibold text-neon-cyan">{t.quickTest}</span>
          <span className="mt-0.5 text-[10px] text-muted">{t.quickTestHint}</span>
        </NavLink>

        <LocaleSwitch />

        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-lg border border-border/60 px-2.5 py-2 text-left text-[11px] font-medium text-muted transition hover:border-neon-blue/20 hover:text-accent"
        >
          {t.logout}
        </button>
      </div>
    </aside>
  );
}

export function AppMobileNav() {
  const { t } = useLocale();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-t border-neon-blue/15 bg-panel/80 px-2 py-2 md:hidden"
      aria-label="Main mobile"
    >
      {navItems.slice(0, 5).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
              isActive ? "bg-neon-cyan/10 text-neon-cyan" : "text-muted"
            }`
          }
        >
          {t.nav[item.key]}
        </NavLink>
      ))}
      <NavLink
        to="/diagnostic/light"
        className="shrink-0 rounded-md border border-neon-cyan/35 bg-neon-cyan/10 px-2.5 py-1.5 text-[11px] font-semibold text-neon-cyan"
      >
        {t.quickTest}
      </NavLink>
    </nav>
  );
}
