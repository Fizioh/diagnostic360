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
    <div className="space-y-1.5">
      {rows.map((row) => {
        const hasScore = !row.insufficient && row.score != null;
        const width = hasScore ? Math.min(100, row.score as number) : 0;
        return (
          <Link
            key={row.domain}
            to={`/readiness?domain=${row.domain}`}
            className="group grid grid-cols-[5.25rem_1fr_2.25rem] items-center gap-2.5 rounded-md px-1 py-0.5 transition hover:bg-surface/50"
          >
            <span className="truncate text-xs text-muted transition group-hover:text-accent">
              {row.label.split(" / ")[0]}
            </span>
            <div className="relative h-2 overflow-hidden rounded-full bg-border/60">
              {hasScore ? (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-signal/85"
                  style={{ width: `${width}%` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(37,40,48,0.9)_4px,rgba(37,40,48,0.9)_8px)] opacity-40" />
              )}
            </div>
            <span
              className={`text-right text-xs tabular-nums ${hasScore ? "font-medium text-accent" : "text-muted/70"}`}
            >
              {hasScore ? row.score : "—"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
