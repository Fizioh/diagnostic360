import { Link } from "react-router-dom";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface ReadinessGaugeProps {
  score: number | null;
  insufficient: boolean;
  profileLabel: string;
  basis?: "validated" | "provisional" | "none";
  qualitySubtitle?: string | null;
}

export function ReadinessGauge({
  score,
  insufficient,
  profileLabel,
  basis = "validated",
  qualitySubtitle,
}: ReadinessGaugeProps) {
  if (insufficient || score == null) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-border text-lg text-muted">
          —
        </div>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">Baseline required</p>
        <ChartCompactEmpty label="" href="/diagnostic/light" linkLabel="Light Diagnostic ~15 min →" />
      </div>
    );
  }

  const r = 32;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = c * pct;
  const ringClass = basis === "provisional" ? "text-amber-400/85" : "text-accent";

  return (
    <div className="flex items-center gap-3">
      <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`Overall readiness ${score}`}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="currentColor" className="text-border/70" strokeWidth="5" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="currentColor"
          className={ringClass}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 38 38)"
        />
        <text x="38" y="41" textAnchor="middle" className="fill-accent text-[14px] font-semibold">
          {score}
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          {basis === "provisional" ? "Provisional readiness" : "Validated readiness"}
        </p>
        <p className="truncate text-xs font-medium text-accent">{profileLabel}</p>
        {qualitySubtitle && <p className="mt-0.5 line-clamp-2 text-[10px] text-muted">{qualitySubtitle}</p>}
        <Link to="/readiness" className="mt-1 inline-block text-[10px] text-accent hover:underline">
          Drill-down →
        </Link>
      </div>
    </div>
  );
}
