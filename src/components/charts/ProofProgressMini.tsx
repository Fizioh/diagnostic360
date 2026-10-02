import type { ProofsSummary } from "../../domain/dashboard/buildCockpitV3Model";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface ProofProgressMiniProps {
  summary: ProofsSummary;
}

export function ProofProgressMini({ summary }: ProofProgressMiniProps) {
  if (!summary.hasData) {
    return <ChartCompactEmpty label="No proofs tracked" href="/data" linkLabel="Data →" />;
  }

  const pct = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <div>
      <p className="text-lg font-semibold tabular-nums text-accent">
        {summary.completed}
        <span className="text-sm font-normal text-muted"> / {summary.total}</span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/80">
        <div className="h-full bg-accent/70" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-muted">Engineering proofs</p>
    </div>
  );
}
