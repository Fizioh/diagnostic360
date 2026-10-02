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
      <div className="flex items-center gap-4">
        <div
          className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border/80 bg-surface/50"
          aria-hidden
        >
          <span className="font-mono text-lg text-muted/80">—</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Baseline required</p>
          <p className="mt-0.5 text-xs leading-snug text-accent/90">Provisional or validated readiness needs evidence.</p>
          <div className="mt-2">
            <ChartCompactEmpty
              label=""
              href="/diagnostic/light"
              linkLabel="Light Diagnostic · ~15 min →"
              compact
            />
          </div>
        </div>
      </div>
    );
  }

  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = c * pct;
  const ringClass = basis === "provisional" ? "text-amber-400/90" : "text-signal";

  return (
    <div className="flex items-center gap-4">
      <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`Overall readiness ${score}`} className="shrink-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="currentColor"
          className={ringClass}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="39" textAnchor="middle" className="fill-accent text-[15px] font-semibold">
          {score}
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {basis === "provisional" ? "Provisional" : "Validated"}
        </p>
        <p className="truncate text-sm font-medium text-accent">{profileLabel}</p>
        {qualitySubtitle && (
          <p className="mt-0.5 line-clamp-2 font-mono text-[10px] leading-snug text-muted">{qualitySubtitle}</p>
        )}
        <Link to="/readiness" className="mt-1.5 inline-block text-[11px] font-medium text-signal hover:underline">
          Drill-down →
        </Link>
      </div>
    </div>
  );
}
