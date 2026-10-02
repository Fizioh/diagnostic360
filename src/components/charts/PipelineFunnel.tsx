import { Link } from "react-router-dom";
import type { PipelineStage } from "../../domain/dashboard/buildDashboardModel";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface PipelineFunnelProps {
  stages: PipelineStage[];
  arrowLabel: string | null;
  caption: string | null;
}

export function PipelineFunnel({ stages, arrowLabel, caption }: PipelineFunnelProps) {
  if (!stages.length || !arrowLabel) {
    return <ChartCompactEmpty label="Pipeline empty" href="/data" linkLabel="Import planning →" />;
  }

  return (
    <div>
      <p className="text-lg tabular-nums tracking-tight text-neon-cyan">{arrowLabel}</p>
      {caption && <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-muted">{caption}</p>}
      <Link to="/data" className="cockpit-link mt-1.5 inline-block text-[11px]">
        View pipeline →
      </Link>
    </div>
  );
}
