import type { ReactNode } from "react";

interface CockpitSectionProps {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function CockpitSection({ title, action, className = "", children }: CockpitSectionProps) {
  return (
    <section className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</h2>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
