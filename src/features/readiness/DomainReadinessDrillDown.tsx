import type { DomainReadinessExplanation } from "../../domain/readiness/explainDomainReadiness";

function formatCalibration(value: DomainReadinessExplanation["calibration"]): string {
  if (!value) return "—";
  if (value === "overconfident") return "over";
  if (value === "underconfident") return "under";
  return "aligned";
}

interface Props {
  explanation: DomainReadinessExplanation;
}

export function DomainReadinessDrillDown({ explanation }: Props) {
  const {
    label,
    score,
    insufficientEvidence,
    calibration,
    trend,
    trendPreviousScore,
    avgSelfConfidencePercent,
    totalEffectiveWeight,
    scoreFromWeights,
    evidenceLines,
    weaknesses,
    lastValidatedAt,
    lastValidatedStrength,
    lastValidatedSourceType,
  } = explanation;

  return (
    <section className="rounded-lg border border-border bg-panel p-4 space-y-4">
      <header>
        <h3 className="font-mono text-[10px] uppercase text-muted">Drill-down · {label}</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs text-muted">Domain readiness</p>
            <p className="font-mono text-lg text-accent">
              {insufficientEvidence ? (
                <span className="text-base text-amber-200/90">Insufficient evidence</span>
              ) : (
                score
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">From weights</p>
            <p className="font-mono">
              {scoreFromWeights ?? "—"} = min(100, round({totalEffectiveWeight.toFixed(2)} / 6 × 100))
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Calibration</p>
            <p className="font-mono">{formatCalibration(calibration)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Trend</p>
            <p className="font-mono">
              {trend}
              {trendPreviousScore != null && score != null
                ? ` (${trendPreviousScore} → ${score})`
                : trend === "unknown"
                  ? ""
                  : " (single evidence point)"}
            </p>
          </div>
          {avgSelfConfidencePercent != null && (
            <div>
              <p className="text-xs text-muted">Avg self-confidence</p>
              <p className="font-mono">{avgSelfConfidencePercent}%</p>
            </div>
          )}
        </div>
      </header>

      {lastValidatedAt && (
        <div className="rounded border border-border/80 px-3 py-2 text-sm">
          <p className="text-xs text-muted">Last validated performance</p>
          <p className="font-mono text-accent">
            {lastValidatedStrength} · {lastValidatedSourceType} · {new Date(lastValidatedAt).toLocaleString()}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs text-muted">Supporting evidence ({evidenceLines.length})</p>
        {evidenceLines.length === 0 ? (
          <p className="mt-2 text-sm text-amber-200/90">Insufficient evidence — no validated items for this domain.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="font-mono text-[10px] uppercase text-muted border-b border-border">
                <tr>
                  <th className="py-2 pr-2">Title</th>
                  <th className="py-2 pr-2">Source</th>
                  <th className="py-2 pr-2">Strength</th>
                  <th className="py-2 pr-2">Base</th>
                  <th className="py-2 pr-2">Recency</th>
                  <th className="py-2 pr-2">Effective</th>
                  <th className="py-2 pr-2">Validated</th>
                  <th className="py-2">Self</th>
                </tr>
              </thead>
              <tbody>
                {evidenceLines.map((line) => (
                  <tr key={line.id} className="border-b border-border/50">
                    <td className="py-2 pr-2">
                      <span className="font-mono text-accent">{line.title}</span>
                      {line.description && (
                        <span className="block text-muted truncate max-w-[200px]">{line.description}</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 font-mono text-muted">{line.sourceType}</td>
                    <td className="py-2 pr-2 font-mono">{line.strength}</td>
                    <td className="py-2 pr-2 font-mono">{line.baseWeight}</td>
                    <td className="py-2 pr-2 font-mono">{line.recencyFactor.toFixed(3)}</td>
                    <td className="py-2 pr-2 font-mono">{line.effectiveWeight.toFixed(3)}</td>
                    <td className="py-2 pr-2 font-mono text-muted">
                      {new Date(line.validatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 font-mono">{line.selfConfidencePercent ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-muted">Linked weaknesses ({weaknesses.length})</p>
        {weaknesses.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None open for this domain.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {weaknesses.map((w) => (
              <li key={w.id} className="rounded border border-border/80 px-2 py-1 text-muted">
                <span className="font-mono text-accent">{w.summary}</span>
                <span className="ml-2 text-[10px]">({w.status})</span>
                {w.cause && <span className="block text-xs">Cause: {w.cause}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
