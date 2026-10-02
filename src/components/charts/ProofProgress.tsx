import { Link } from "react-router-dom";
import type { ProofsSummary } from "../../domain/dashboard/buildCockpitV3Model";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface ProofProgressProps {
  summary: ProofsSummary;
  nextProofTitle: string | null;
}

export function ProofProgress({ summary, nextProofTitle }: ProofProgressProps) {
  if (!summary.hasData) {
    return <ChartCompactEmpty label="No proofs tracked" href="/data" linkLabel="Data →" />;
  }

  const pct = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <div>
      <p className="text-lg tabular-nums text-accent">
        {summary.completed}
        <span className="text-sm font-normal text-muted"> / {summary.total}</span>
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/70">
        <div className="h-full bg-accent/70" style={{ width: `${pct}%` }} />
      </div>
      {nextProofTitle && (
        <p className="mt-1 truncate text-[10px] text-muted">
          Next: <span className="text-accent/90">{nextProofTitle}</span>
        </p>
      )}
      <Link to="/data" className="mt-1.5 inline-block text-[11px] font-medium text-signal hover:underline">
        View proofs →
      </Link>
    </div>
  );
}
