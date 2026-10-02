import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  id?: string;
}

export function Panel({ title, subtitle, className = "", children, id }: PanelProps) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-border/80 bg-panel/90 shadow-sm shadow-black/20 ${className}`}
    >
      <header className="border-b border-border/60 px-5 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-accent">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
