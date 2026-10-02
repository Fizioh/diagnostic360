import { Link } from "react-router-dom";
import { computeAllDomains } from "../../domain/readiness/computeReadiness";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-panel p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

export function DashboardPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const { snapshot, loading: notionLoading } = useNotionPlanning();
  const evidence = workspace?.evidence ?? [];
  const domains = computeAllDomains(evidence);
  const validatedCount = domains.filter((d) => !d.insufficientEvidence).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium">Overview</h2>
        <p className="mt-1 text-sm text-muted">
          PLAN → PRACTICE → ASSESS → EVIDENCE → WEAKNESS → REMEDIATE → RETEST → READINESS
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Today">
          {notionLoading ? (
            <span className="text-muted">Loading planning context…</span>
          ) : (
            <ul className="space-y-1 text-muted">
              {snapshot?.preparationTasks.slice(0, 3).map((t) => (
                <li key={t.title}>· {t.title}</li>
              ))}
            </ul>
          )}
          <Link to="/today" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
            Open Today →
          </Link>
        </Card>
        <Card title="Diagnostic 360">
          <p className="text-muted">10-module technical assessment (local session).</p>
          <Link to="/diagnostic" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
            Open Diagnostic →
          </Link>
        </Card>
        <Card title="Readiness">
          {wsLoading ? (
            <span className="text-muted">Loading workspace…</span>
          ) : validatedCount === 0 ? (
            <span className="text-amber-200/90">Insufficient evidence</span>
          ) : (
            <span>{validatedCount} domains with validated evidence</span>
          )}
          <Link to="/readiness" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
            View Readiness →
          </Link>
        </Card>
        <Card title="Weaknesses & retests">
          <p className="text-muted">
            Open: {workspace?.weaknesses.filter((w) => w.status !== "mastered").length ?? 0} · Retests:{" "}
            {workspace?.retests.length ?? 0}
          </p>
        </Card>
        <Card title="Notion context">
          {notionLoading ? (
            <span className="text-muted">…</span>
          ) : (
            <>
              <p className="text-xs text-muted">Source: {snapshot?.source}</p>
              <p className="mt-2 text-muted">{snapshot?.roadmap[0]?.title}</p>
            </>
          )}
        </Card>
        <Card title="Engineering proofs">
          {snapshot?.engineeringProofs.map((p) => (
            <p key={p.title} className="text-muted">
              · {p.title}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}
