import { Link } from "react-router-dom";

interface ChartCompactEmptyProps {
  label: string;
  href: string;
  linkLabel: string;
  compact?: boolean;
}

export function ChartCompactEmpty({ label, href, linkLabel, compact = false }: ChartCompactEmptyProps) {
  if (compact && !label) {
    return (
      <Link
        to={href}
        className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-surface/50 px-2.5 py-1.5 text-[11px] font-medium text-accent transition hover:border-accent/30 hover:bg-surface/80"
      >
        {linkLabel}
      </Link>
    );
  }

  return (
    <div className={`rounded-md border border-dashed border-border/55 bg-surface/40 ${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}>
      {label ? <p className="text-[11px] leading-snug text-muted">{label}</p> : null}
      <Link
        to={href}
        className={`inline-flex items-center gap-1 font-medium text-accent hover:underline ${label ? "mt-1.5" : ""} text-[11px]`}
      >
        {linkLabel}
      </Link>
    </div>
  );
}
