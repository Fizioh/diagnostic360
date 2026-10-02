import type { PipelineStage } from "../../domain/dashboard/buildDashboardModel";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface PipelineMiniFunnelProps {
  stages: PipelineStage[];
}

export function PipelineMiniFunnel({ stages }: PipelineMiniFunnelProps) {
  if (!stages.length) {
    return <ChartCompactEmpty label="Pipeline empty" href="/data" linkLabel="Import planning →" />;
  }

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="flex items-end gap-1.5">
      {stages.map((s) => (
        <div key={s.status} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
          <div
            className="w-full rounded-t bg-accent/50"
            style={{ height: `${12 + (s.count / max) * 28}px` }}
            title={`${s.status}: ${s.count}`}
          />
          <span className="w-full truncate text-center text-[9px] text-muted">{s.status}</span>
          <span className="text-[10px] tabular-nums text-accent">{s.count}</span>
        </div>
      ))}
    </div>
  );
}
