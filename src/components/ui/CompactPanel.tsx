import type { ReactNode } from "react";

interface CompactPanelProps {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function CompactPanel({ title, action, className = "", children }: CompactPanelProps) {
  return (
    <section className={`rounded-lg border border-border/80 bg-panel/90 ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</h2>
        {action}
      </header>
      <div className="px-3 py-2">{children}</div>
    </section>
  );
}
