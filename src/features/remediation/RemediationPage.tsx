import { useState } from "react";
import {
  failRetest,
  passRetest,
  scheduleRetest,
  startRemediation,
} from "../../domain/weakness/retestLoop";
import { useWorkspace } from "../../hooks/useWorkspace";

export function RemediationPage() {
  const { workspace, persist, loading } = useWorkspace();
  const [draftRemediation, setDraftRemediation] = useState<Record<string, string>>({});

  if (loading || !workspace) {
    return <p className="text-muted">Loading…</p>;
  }

  const open = workspace.weaknesses.filter((w) => w.status !== "mastered");
  const scheduledRetests = workspace.retests.filter((r) => r.status === "scheduled");
  const errorLogOpen = (workspace.errorLog ?? []).filter((e) => e.status === "open");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium">Error log & remediation</h2>
        <p className="mt-1 text-sm text-muted">
          Weaknesses from diagnostic review → remediate → retest → stronger evidence → readiness.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h3 className="font-mono text-[10px] uppercase text-muted">
          Diagnostic error log ({errorLogOpen.length} open)
        </h3>
        {errorLogOpen.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No structured errors from imported reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {errorLogOpen.map((e) => (
              <li key={e.id} className="rounded border border-border px-3 py-2 text-sm">
                <p className="font-mono text-accent">{e.summary}</p>
                <p className="mt-1 text-xs text-muted">
                  {e.domain} · {e.errorType}
                  {e.initialScore != null ? ` · score ${e.initialScore}` : ""}
                </p>
                {e.cause && <p className="mt-1 text-xs text-muted">Cause: {e.cause}</p>}
                {e.remediation && <p className="mt-1 text-xs text-muted">Remediation: {e.remediation}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h3 className="font-mono text-[10px] uppercase text-muted">Scheduled retests ({scheduledRetests.length})</h3>
        {scheduledRetests.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No retests scheduled.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {scheduledRetests.map((r) => {
              const w = workspace.weaknesses.find((x) => x.id === r.weaknessId);
              if (!w) return null;
              return (
                <li key={r.id} className="rounded border border-border px-3 py-2 text-sm">
                  <p className="font-mono text-accent">{w.summary}</p>
                  <p className="text-xs text-muted">
                    {w.domain} · due {r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const { workspace: next } = passRetest(workspace, r.id);
                        await persist(next);
                      }}
                      className="font-mono text-[10px] text-accent hover:underline"
                    >
                      Mark retest passed
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await persist(failRetest(workspace, r.id));
                      }}
                      className="font-mono text-[10px] text-muted hover:underline"
                    >
                      Mark failed
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h3 className="font-mono text-[10px] uppercase text-muted">Open weaknesses ({open.length})</h3>
        {open.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Import a diagnostic review to populate the error log.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {open.map((w) => (
              <li key={w.id} className="rounded border border-border px-3 py-3 text-sm">
                <p className="font-mono text-accent">{w.summary}</p>
                <p className="mt-1 text-xs text-muted">
                  {w.domain} · {w.status}
                </p>
                <textarea
                  value={draftRemediation[w.id] ?? w.remediation ?? ""}
                  onChange={(e) => setDraftRemediation((d) => ({ ...d, [w.id]: e.target.value }))}
                  rows={2}
                  placeholder="Remediation plan"
                  className="mt-2 w-full rounded border border-border bg-bg px-2 py-1 font-mono text-xs"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const text = draftRemediation[w.id] ?? w.remediation ?? "";
                      await persist(startRemediation(workspace, w.id, text));
                    }}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    Save remediation
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await persist(scheduleRetest(workspace, w.id));
                    }}
                    className="font-mono text-[10px] text-muted hover:underline"
                  >
                    Schedule retest
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
