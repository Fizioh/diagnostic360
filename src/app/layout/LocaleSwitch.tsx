import { useLocale } from "../i18n/LocaleProvider";
import type { Locale } from "../i18n/messages";

export function LocaleSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();

  const btn = (code: Locale, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLocale(code)}
      className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
        locale === code
          ? "bg-neon-cyan/15 text-neon-cyan shadow-neon-sm"
          : "text-muted hover:bg-neon-blue/10 hover:text-accent"
      }`}
      aria-pressed={locale === code}
    >
      {label}
    </button>
  );

  if (compact) {
    return (
      <div className="flex gap-0.5 rounded-lg border border-neon-blue/20 bg-panel/60 p-0.5" role="group" aria-label="Language">
        {btn("fr", "FR")}
        {btn("en", "EN")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="px-1 text-[10px] uppercase tracking-wider text-muted">Lang</span>
      <div className="flex gap-0.5 rounded-lg border border-neon-blue/20 bg-panel/60 p-0.5" role="group" aria-label="Language">
        {btn("fr", "FR")}
        {btn("en", "EN")}
      </div>
    </div>
  );
}
