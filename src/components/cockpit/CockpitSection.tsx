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
      ? "border border-border/55 bg-panel/95 shadow-[inset_3px_0_0_0_rgba(107,158,122,0.55)]"
      : variant === "kpi"
        ? "border border-border/45 bg-panel/70"
        : "border border-border/50 bg-panel/85";

  const headerPad = variant === "kpi" ? "px-2.5 py-1" : "px-3 py-1.5";
  const bodyPad = variant === "kpi" ? "px-2.5 py-2" : "px-3 py-2.5";

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg ${shell} ${className}`}
    >
      <div className={`flex shrink-0 items-center justify-between gap-2 border-b border-border/35 ${headerPad}`}>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
        {action}
      </div>
      <div className={`min-h-0 flex-1 overflow-auto ${bodyPad}`}>{children}</div>
    </section>
  );
}
