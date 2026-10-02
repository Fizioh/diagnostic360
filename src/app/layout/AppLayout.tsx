import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/today", label: "Today" },
  { to: "/diagnostic", label: "Diagnostic 360" },
  { to: "/readiness", label: "Readiness" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface text-accent">
      <header className="border-b border-border px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">Mission 2027</p>
            <h1 className="text-sm font-medium tracking-wide">Engineering Readiness Control Center</h1>
          </div>
          <nav className="flex flex-wrap gap-1 font-mono text-[10px]" aria-label="Main">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1.5 ${isActive ? "bg-accent/10 text-accent" : "text-muted hover:text-accent"}`
                }
              >
                {item.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
