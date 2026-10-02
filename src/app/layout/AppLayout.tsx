import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthProvider";

const nav = [
  { to: "/", label: "Cockpit" },
  { to: "/today", label: "Today" },
  { to: "/diagnostic", label: "Diagnostic" },
  { to: "/readiness", label: "Readiness" },
  { to: "/analytics", label: "Analytics" },
  { to: "/remediation", label: "Remediation" },
  { to: "/data", label: "Data" },
];

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-accent">
      <header className="border-b border-neon-blue/15 bg-panel/40 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] text-muted uppercase">Mission 2027</p>
            <h1 className="text-sm font-semibold tracking-tight">Control Center</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-1 text-xs font-medium" aria-label="Main">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 transition ${isActive ? "border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan shadow-neon-sm" : "text-muted hover:text-accent"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => logout()}
            className="font-mono text-[10px] text-muted hover:text-accent"
          >
            LOGOUT
          </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 md:px-5 md:py-5">
        <Outlet />
      </main>
    </div>
  );
}
