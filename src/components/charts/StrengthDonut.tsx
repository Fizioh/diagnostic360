import type { EvidenceStrengthTotals } from "../../domain/analytics";
import { ChartCompactEmpty } from "./ChartCompactEmpty";

const COLORS = {
  strong: "text-signal drop-shadow-[0_0_8px_rgba(61,255,154,0.5)]",
  medium: "text-neon-amber drop-shadow-[0_0_8px_rgba(255,184,77,0.4)]",
  weak: "text-muted",
};

interface StrengthDonutProps {
  totals: EvidenceStrengthTotals;
}

export function StrengthDonut({ totals }: StrengthDonutProps) {
  if (totals.total === 0) {
    return <ChartCompactEmpty label="Baseline required" href="/diagnostic" linkLabel="Run Diagnostic 360 →" />;
  }

  const segments = [
    { key: "strong" as const, value: totals.strong },
    { key: "medium" as const, value: totals.medium },
    { key: "weak" as const, value: totals.weak },
  ].filter((s) => s.value > 0);

  const r = 28;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label="Evidence strength composition">
        {segments.map((seg) => {
          const frac = seg.value / totals.total;
          const dash = c * frac;
          const el = (
            <circle
              key={seg.key}
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke="currentColor"
              className={COLORS[seg.key]}
              strokeWidth="10"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 36 36)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="36" y="38" textAnchor="middle" className="fill-accent text-[11px] font-medium">
          {totals.total}
        </text>
      </svg>
      <ul className="space-y-0.5 text-[10px] text-muted">
        <li>
          <span className="text-emerald-400">●</span> Strong {totals.strong}
        </li>
        <li>
          <span className="text-amber-400/90">●</span> Medium {totals.medium}
        </li>
        <li>
          <span className="text-muted">●</span> Weak {totals.weak}
        </li>
      </ul>
    </div>
  );
}
