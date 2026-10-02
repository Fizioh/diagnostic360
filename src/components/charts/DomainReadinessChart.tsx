import { Link } from "react-router-dom";
import type { ReadinessDomain } from "../../domain/types";

interface Row {
  label: string;
  domain: ReadinessDomain;
  score: number | null;
  insufficient: boolean;
}

interface DomainReadinessChartProps {
  rows: Row[];
}

export function DomainReadinessChart({ rows }: DomainReadinessChartProps) {
  return (
    <div className="space-y-1">
      {rows.map((row) => {
        const width = row.insufficient || row.score == null ? 0 : Math.min(100, row.score);
        return (
          <Link
            key={row.domain}
            to={`/readiness?domain=${row.domain}`}
            className="group grid grid-cols-[minmax(0,5.5rem)_1fr_2rem] items-center gap-2 rounded px-0.5 py-0.5 hover:bg-surface/40"
          >
            <span className="truncate text-[11px] text-muted group-hover:text-accent">{row.label.split(" / ")[0]}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
              <div className="h-full rounded-full bg-accent/75" style={{ width: `${width}%` }} />
            </div>
            <span className="text-right text-[11px] tabular-nums text-accent/90">
              {row.insufficient || row.score == null ? "—" : row.score}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
