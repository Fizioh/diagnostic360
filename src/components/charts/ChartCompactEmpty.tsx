import { Link } from "react-router-dom";

interface ChartCompactEmptyProps {
  label: string;
  href: string;
  linkLabel: string;
}

export function ChartCompactEmpty({ label, href, linkLabel }: ChartCompactEmptyProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-xs">
      <span className="text-muted">{label}</span>
      <Link to={href} className="shrink-0 font-medium text-accent hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
