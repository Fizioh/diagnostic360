import type { WeeklyEffortDay } from "../../domain/analytics";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

function formatHoursMinutes(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

interface WeeklyEffortChartProps {
  days: WeeklyEffortDay[];
  hasReliableDuration: boolean;
  totalDiagnosticSeconds: number;
}

export function WeeklyEffortChart({ days, hasReliableDuration, totalDiagnosticSeconds }: WeeklyEffortChartProps) {
  if (!hasReliableDuration && days.every((d) => d.tasksCompleted === 0)) {
    return <ChartCompactEmpty label="No time logged" href="/diagnostic" linkLabel="Start assessment →" />;
  }

  const max = Math.max(...days.map((d) => d.diagnosticSeconds ?? 0), 1);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div>
      {hasReliableDuration && (
        <p className="text-sm tabular-nums text-accent">{formatHoursMinutes(totalDiagnosticSeconds)} diagnostic</p>
      )}
      {!hasReliableDuration && days.some((d) => d.tasksCompleted > 0) && (
        <p className="text-sm text-accent">{days.reduce((n, d) => n + d.tasksCompleted, 0)} tasks completed</p>
      )}
      <div className="mt-1.5 flex items-end justify-between gap-0.5" style={{ height: 36 }}>
        {days.map((d, i) => {
          const v = d.diagnosticSeconds ?? 0;
          const h = v > 0 ? Math.max(3, (v / max) * 32) : 2;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className={`w-full max-w-[14px] rounded-sm ${v > 0 ? "bg-accent/65" : "bg-border/50"}`}
                style={{ height: h }}
              />
              <span className="text-[8px] text-muted">{labels[i] ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
