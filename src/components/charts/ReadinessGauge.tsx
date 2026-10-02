import { Link } from "react-router-dom";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface ReadinessGaugeProps {
  score: number | null;
  insufficient: boolean;
  profileLabel: string;
}

export function ReadinessGauge({ score, insufficient, profileLabel }: ReadinessGaugeProps) {
  if (insufficient || score == null) {
    return (
      <div className="flex h-full min-h-[7rem] flex-col items-center justify-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border text-xl text-muted">
          —
        </div>
        <ChartCompactEmpty label="Baseline required" href="/diagnostic" linkLabel="Run Diagnostic 360 →" />
      </div>
    );
  }

  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = c * pct;

  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80" role="img" aria-label={`Overall readiness ${score}`}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-border/80" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" className="fill-accent text-[15px] font-semibold">
          {score}
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-xs text-muted">Validated readiness</p>
        <p className="truncate text-sm font-medium text-accent">{profileLabel}</p>
        <Link to="/readiness" className="mt-1 inline-block text-xs text-accent hover:underline">
          Drill-down →
        </Link>
      </div>
    </div>
  );
}
