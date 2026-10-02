import { Link } from "react-router-dom";
import { domainAccent } from "../cockpit/domainAccent";
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
      {rows.map((row, index) => {
        const hasScore = !row.insufficient && row.score != null;
        const width = hasScore ? Math.min(100, row.score as number) : 0;
        const accent = domainAccent(row.domain, index);
        return (
          <Link
            key={row.domain}
            to={`/readiness?domain=${row.domain}`}
            className="group grid grid-cols-[1.5rem_minmax(0,4.5rem)_1fr_2.25rem] items-center gap-2 rounded-lg px-0.5 py-0.5 transition hover:bg-neon-blue/5"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-semibold ${accent.chip}`}
            >
              {accent.initial}
            </span>
            <span className="truncate text-xs text-muted transition group-hover:text-accent">
              {row.label.split(" / ")[0]}
            </span>
            <div className="relative h-2 overflow-hidden rounded-full bg-border/80">
              {hasScore ? (
                <div className={`absolute inset-y-0 left-0 rounded-full ${accent.bar}`} style={{ width: `${width}%` }} />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(30,45,69,0.95)_5px,rgba(30,45,69,0.95)_10px)] opacity-60" />
              )}
            </div>
            <span
              className={`text-right text-xs tabular-nums ${hasScore ? "font-medium text-neon-cyan" : "text-muted/70"}`}
            >
              {hasScore ? row.score : "—"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
