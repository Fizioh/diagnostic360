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
      <Link to={href} className="cockpit-btn-primary inline-flex items-center gap-1.5 text-[11px]">
        {linkLabel}
      </Link>
    );
  }

  return (
    <div
      className={`rounded-lg border border-dashed border-neon-blue/25 bg-neon-blue/5 ${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}
    >
      {label ? <p className="text-[11px] leading-snug text-muted">{label}</p> : null}
      <Link to={href} className={`cockpit-link inline-flex items-center gap-1 text-[11px] ${label ? "mt-1.5" : ""}`}>
        {linkLabel}
      </Link>
    </div>
  );
}
