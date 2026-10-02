import { useState } from "react";
import {
  computeAllDomains,
  evidenceForDomain,
  weaknessesForDomain,
} from "../../domain/readiness/computeReadiness";
import { computeAllProfiles, TARGET_PROFILES } from "../../domain/readiness/targetProfiles";
import type { ReadinessDomain } from "../../domain/types";
import { useWorkspace } from "../../hooks/useWorkspace";

export function ReadinessPage() {
  const { workspace, loading } = useWorkspace();
  const [selected, setSelected] = useState<ReadinessDomain | null>(null);
  const evidence = workspace?.evidence ?? [];
  const domains = computeAllDomains(evidence);
  const profiles = computeAllProfiles(evidence);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium">Readiness</h2>
      <p className="text-sm text-muted">Evidence-based indicators — not hiring probabilities.</p>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            {profiles.map((p) => (
              <div key={p.profileId} className="rounded-lg border border-border bg-panel p-4">
                <p className="font-mono text-[10px] uppercase text-muted">{p.label}</p>
                <p className="mt-2 text-2xl font-medium">
                  {p.insufficientEvidence ? (
                    <span className="text-base text-amber-200/90">Insufficient evidence</span>
                  ) : (
                    p.score
                  )}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Coverage {Math.round((p.coveredWeight / p.totalWeight) * 100)}% of weighted domains
                </p>
              </div>
            ))}
          </section>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border font-mono text-[10px] uppercase text-muted">
                <tr>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Evidence</th>
                  <th className="p-3">Trend</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr
                    key={d.domain}
                    className={`cursor-pointer border-b border-border/60 hover:bg-accent/5 ${selected === d.domain ? "bg-accent/10" : ""}`}
                    onClick={() => setSelected(selected === d.domain ? null : d.domain)}
                  >
                    <td className="p-3">{d.label}</td>
                    <td className="p-3 font-mono">
                      {d.insufficientEvidence ? (
                        <span className="text-amber-200/90">Insufficient evidence</span>
                      ) : (
                        d.score
                      )}
                    </td>
                    <td className="p-3 text-muted">{d.evidenceCount}</td>
                    <td className="p-3 font-mono text-xs text-muted">{d.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <section className="rounded-lg border border-border bg-panel p-4">
              <h3 className="font-mono text-[10px] uppercase text-muted">Drill-down · {selected}</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted">Supporting evidence</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {evidenceForDomain(selected, evidence).map((e) => (
                      <li key={e.id} className="rounded border border-border/80 px-2 py-1">
                        <span className="font-mono text-accent">{e.title}</span>
                        <span className="ml-2 text-[10px] text-muted">{e.strength}</span>
                      </li>
                    ))}
                    {evidenceForDomain(selected, evidence).length === 0 && (
                      <li className="text-muted">None validated</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted">Open weaknesses</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {weaknessesForDomain(selected, workspace?.weaknesses ?? []).map((w) => (
                      <li key={w.id} className="text-muted">
                        · {w.summary} ({w.status})
                      </li>
                    ))}
                    {weaknessesForDomain(selected, workspace?.weaknesses ?? []).length === 0 && (
                      <li className="text-muted">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <p className="text-xs text-muted">
            Profiles: {TARGET_PROFILES.map((p) => p.id).join(", ")} — weighted from domain readiness only.
          </p>
        </>
      )}
    </div>
  );
}
