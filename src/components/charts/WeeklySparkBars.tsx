import type { WeeklyEffortDay } from "../../domain/analytics";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface WeeklySparkBarsProps {
  days: WeeklyEffortDay[];
  hasReliableDuration: boolean;
}

export function WeeklySparkBars({ days, hasReliableDuration }: WeeklySparkBarsProps) {
  if (!hasReliableDuration) {
    return <ChartCompactEmpty label="No duration data" href="/diagnostic" linkLabel="Import review →" />;
  }

  const max = Math.max(...days.map((d) => d.diagnosticSeconds ?? 0), 1);

  return (
    <div className="flex items-end justify-between gap-1" style={{ height: 48 }}>
      {days.map((d) => {
        const v = d.diagnosticSeconds ?? 0;
        const h = v > 0 ? Math.max(4, (v / max) * 44) : 2;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className={`w-full max-w-[1.25rem] rounded-sm ${v > 0 ? "bg-accent/70" : "bg-border/60"}`}
              style={{ height: h }}
              title={v > 0 ? `${Math.round(v / 60)} min diagnostic` : undefined}
            />
            <span className="text-[9px] text-muted">{d.date.slice(8)}</span>
          </div>
        );
      })}
    </div>
  );
}
