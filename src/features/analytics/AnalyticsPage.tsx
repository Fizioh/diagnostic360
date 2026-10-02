import { useMemo } from "react";
import { computeMissionAnalytics } from "../../domain/analytics";
import { useWorkspace } from "../../hooks/useWorkspace";
import { formatDuration } from "../../lib/formatTime";

export function AnalyticsPage() {
  const { workspace, loading } = useWorkspace();
  const model = useMemo(
    () => computeMissionAnalytics(workspace, { tasks: workspace?.tasks ?? [] }),
    [workspace],
  );

  if (loading) {
    return <p className="text-sm text-muted">Loading workspace…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium">Analytics</h2>
        <p className="text-sm text-muted">Persisted evidence, reviews, and snapshots only — no synthetic history.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-border bg-panel p-4">
          <p className="font-mono text-[10px] uppercase text-muted">Validated evidence</p>
          <p className="mt-2 text-2xl text-accent">{model.validatedEvidenceCount}</p>
        </div>
        <div className="rounded-md border border-border bg-panel p-4">
          <p className="font-mono text-[10px] uppercase text-muted">Reviews imported</p>
          <p className="mt-2 text-2xl text-accent">{model.appliedReviewCount}</p>
        </div>
        <div className="rounded-md border border-border bg-panel p-4">
          <p className="font-mono text-[10px] uppercase text-muted">Diagnostic time</p>
          <p className="mt-2 text-2xl text-accent">
            {model.timeInvested.diagnosticSeconds != null
              ? formatDuration(model.timeInvested.diagnosticSeconds)
              : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">{model.timeInvested.message}</p>
        </div>
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Readiness trend</h3>
        {!model.hasReadinessHistory ? (
          <p className="mt-2 text-sm text-muted">{model.readinessHistoryEmptyMessage}</p>
        ) : (
          <ul className="mt-4 space-y-2 font-mono text-sm">
            {model.profileTrend.map((p) => (
              <li key={p.at} className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted">{new Date(p.at).toLocaleString()}</span>
                <span className="text-accent">{p.score != null ? `${p.score}%` : "insufficient"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Evidence strength (validated)</h3>
        {model.evidenceCompositionEmpty ? (
          <p className="mt-2 text-sm text-muted">No validated evidence yet — import a diagnostic review first.</p>
        ) : (
          <p className="mt-2 font-mono text-sm text-accent">
            Strong {model.evidenceStrengthTotals.strong} · Medium {model.evidenceStrengthTotals.medium} · Weak{" "}
            {model.evidenceStrengthTotals.weak}
          </p>
        )}
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Weekly effort</h3>
        {!model.weeklyEffort.hasReliableDuration ? (
          <p className="mt-2 text-sm text-muted">{model.weeklyEffort.emptyMessage}</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
            {model.weeklyEffort.days.map((d) => (
              <li key={d.date} className="rounded border border-border/60 px-2 py-1">
                <span className="text-muted">{d.date.slice(5)}</span>{" "}
                <span className="text-accent">{d.diagnosticSeconds != null ? `${Math.round(d.diagnosticSeconds / 60)}m diag` : "—"}</span>
                {d.tasksCompleted > 0 && <span className="text-muted"> · {d.tasksCompleted} tasks</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Evidence by domain & strength</h3>
        {model.evidenceCompositionEmpty ? (
          <p className="mt-2 text-sm text-muted">No validated evidence yet — import a diagnostic review first.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-left text-muted">
                  <th className="pb-2">Domain</th>
                  <th className="pb-2">Strong</th>
                  <th className="pb-2">Medium</th>
                  <th className="pb-2">Weak</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {model.evidenceComposition.map((row) => (
                  <tr key={row.domain} className="border-t border-border/50">
                    <td className="py-2 text-accent">{row.domain}</td>
                    <td className="py-2">{row.strong}</td>
                    <td className="py-2">{row.medium}</td>
                    <td className="py-2">{row.weak}</td>
                    <td className="py-2">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Weakness burn-down (snapshots)</h3>
        {model.weaknessBurndownEmpty ? (
          <p className="mt-2 text-sm text-muted">Open weaknesses count appears after each review import snapshot.</p>
        ) : (
          <ul className="mt-4 space-y-2 font-mono text-sm">
            {model.weaknessBurndown.map((p) => (
              <li key={p.at} className="flex justify-between">
                <span className="text-muted">{new Date(p.at).toLocaleString()}</span>
                <span className="text-accent">{p.openWeaknesses} open</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-border bg-panel p-4">
        <h3 className="font-medium">Confidence vs validated performance</h3>
        {model.calibrationEmpty ? (
          <p className="mt-2 text-sm text-muted">
            Need diagnostic evidence with self-confidence and external review outcomes to show calibration.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {model.calibration.map((c) => (
              <li key={c.domain} className="flex justify-between border-b border-border/50 pb-2">
                <span>{c.label}</span>
                <span className="font-mono text-muted">
                  {c.calibration} · score {c.score ?? "—"} · conf {c.confidence ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
