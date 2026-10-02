import { Outlet } from "react-router-dom";
import { AppMobileNav, AppSidebar } from "./AppSidebar";
import { LocaleSwitch } from "./LocaleSwitch";
import { useLocale } from "../i18n/LocaleProvider";
import { Link } from "react-router-dom";

export function AppLayout() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen w-full bg-surface text-accent">
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-neon-blue/15 bg-panel/30 px-4 py-2.5 backdrop-blur-md md:hidden">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neon-cyan/80">{t.brand}</p>
            <p className="text-sm font-semibold">{t.brandSub}</p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitch compact />
            <Link
              to="/diagnostic/light"
              className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-2.5 py-1.5 text-[11px] font-semibold text-neon-cyan"
            >
              {t.quickTest}
            </Link>
          </div>
        </header>

        <main className="min-h-0 w-full flex-1 px-3 py-3 md:px-5 md:py-4">
          <Outlet />
        </main>

        <AppMobileNav />
      </div>
    </div>
  );
}
