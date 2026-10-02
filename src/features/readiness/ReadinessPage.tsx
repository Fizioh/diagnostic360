import { computeAllDomains } from "../../domain/readiness/computeReadiness";
import { useWorkspace } from "../../hooks/useWorkspace";

export function ReadinessPage() {
  const { workspace, loading } = useWorkspace();
  const domains = computeAllDomains(workspace?.evidence ?? []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium">Readiness</h2>
      <p className="text-sm text-muted">Evidence-based indicators — not hiring probabilities.</p>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border font-mono text-[10px] uppercase text-muted">
              <tr>
                <th className="p-3">Domain</th>
                <th className="p-3">Score</th>
                <th className="p-3">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.domain} className="border-b border-border/60">
                  <td className="p-3">{d.label}</td>
                  <td className="p-3 font-mono">
                    {d.insufficientEvidence ? (
                      <span className="text-amber-200/90">Insufficient evidence</span>
                    ) : (
                      d.score
                    )}
                  </td>
                  <td className="p-3 text-muted">{d.evidenceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
