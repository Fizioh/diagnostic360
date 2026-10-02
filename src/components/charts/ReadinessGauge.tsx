import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface ReadinessGaugeProps {
  score: number | null;
  insufficient: boolean;
  profileLabel: string;
  basis?: "validated" | "provisional" | "none";
  qualitySubtitle?: string | null;
}

function ArcGauge({
  pct,
  strokeClass,
  children,
}: {
  pct: number;
  strokeClass: string;
  children: ReactNode;
}) {
  const r = 34;
  const c = Math.PI * r;
  const dash = c * Math.min(1, Math.max(0, pct));
  return (
    <svg width="80" height="48" viewBox="0 0 80 48" className="shrink-0 drop-shadow-[0_0_12px_rgba(46,230,255,0.25)]" aria-hidden>
      <path
        d="M 8 44 A 34 34 0 0 1 72 44"
        fill="none"
        stroke="currentColor"
        className="text-border/90"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 8 44 A 34 34 0 0 1 72 44"
        fill="none"
        stroke="currentColor"
        className={strokeClass}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
      />
      <foreignObject x="0" y="14" width="80" height="32">
        <div className="flex h-full items-end justify-center">{children}</div>
      </foreignObject>
    </svg>
  );
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
        <ArcGauge pct={0} strokeClass="text-neon-cyan/30">
          <span className="font-mono text-xl text-muted/70">—</span>
        </ArcGauge>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neon-cyan/90">Baseline required</p>
          <p className="mt-0.5 text-xs leading-snug text-muted">Run Light Diagnostic for a provisional baseline.</p>
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

  const pct = Math.min(100, Math.max(0, score)) / 100;
  const strokeClass = basis === "provisional" ? "text-neon-amber" : "text-neon-cyan";

  return (
    <div className="flex items-center gap-4">
      <ArcGauge pct={pct} strokeClass={strokeClass}>
        <span className="text-lg font-semibold tabular-nums text-accent">{score}</span>
      </ArcGauge>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {basis === "provisional" ? "Provisional" : "Validated"}
        </p>
        <p className="truncate text-sm font-medium text-accent">{profileLabel}</p>
        {qualitySubtitle && (
          <p className="mt-0.5 line-clamp-2 font-mono text-[10px] leading-snug text-muted">{qualitySubtitle}</p>
        )}
        <Link to="/readiness" className="cockpit-link mt-1.5 inline-block text-[11px]">
          Drill-down →
        </Link>
      </div>
    </div>
  );
}
