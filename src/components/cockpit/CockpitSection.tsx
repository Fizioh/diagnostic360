import type { ReactNode } from "react";

interface CockpitSectionProps {
  title: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "kpi" | "focus";
  children: ReactNode;
}

export function CockpitSection({
  title,
  action,
  className = "",
  variant = "default",
  children,
}: CockpitSectionProps) {
  const shell =
    variant === "focus"
      ? "cockpit-glass-focus rounded-xl"
      : variant === "kpi"
        ? "cockpit-glass-kpi rounded-lg"
        : "cockpit-glass rounded-xl";

  const headerPad = variant === "kpi" ? "px-2.5 py-1" : "px-3 py-1.5";
  const bodyPad = variant === "kpi" ? "px-2.5 py-2" : "px-3 py-2.5";

  return (
    <section className={`relative flex min-h-0 flex-col overflow-hidden ${shell} ${className}`}>
      {variant === "focus" ? (
        <>
          <div className="cockpit-orb -bottom-10 left-0 h-36 w-full bg-gradient-to-t from-neon-cyan/20 to-transparent opacity-90" aria-hidden />
          <div className="cockpit-orb -right-16 -top-8 h-44 w-44 bg-neon-blue/15" aria-hidden />
        </>
      ) : null}
      <div className={`relative z-[1] flex shrink-0 items-center justify-between gap-2 border-b border-neon-blue/10 ${headerPad}`}>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
        {action}
      </div>
      <div className={`relative z-[1] min-h-0 flex-1 overflow-auto ${bodyPad}`}>{children}</div>
    </section>
  );
}
