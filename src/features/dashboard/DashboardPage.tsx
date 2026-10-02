import { Link } from "react-router-dom";
import { computeAllDomains } from "../../domain/readiness/computeReadiness";
import { mergePreparationTasks, tasksByStatus } from "../../domain/tasks/preparationTasks";
import { useDiagnosticSummary } from "../../hooks/useDiagnosticSummary";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";

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
  const diagnostic = useDiagnosticSummary();
  const evidence = workspace?.evidence ?? [];
  const domains = computeAllDomains(evidence);
  const validatedCount = domains.filter((d) => !d.insufficientEvidence).length;
  const strongEvidence = evidence.filter((e) => e.validatedAt && e.strength === "strong").length;
  const mediumEvidence = evidence.filter((e) => e.validatedAt && e.strength === "medium").length;
  const weakEvidence = evidence.filter((e) => e.validatedAt && e.strength === "weak").length;

  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const allTasks = mergePreparationTasks(notionTasks, workspace?.tasks ?? []);
  const byStatus = tasksByStatus(allTasks);
  const openWeaknesses = workspace?.weaknesses.filter((w) => w.status !== "mastered").length ?? 0;
  const dueRetests =
    workspace?.retests.filter((r) => r.status === "scheduled").length ?? 0;
  const errorLogOpen = snapshot?.errorLog.filter((e) => !e.status.toLowerCase().includes("closed")).length ?? 0;

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
              {byStatus.today.slice(0, 4).map((t) => (
                <li key={t.id}>· {t.title}</li>
              ))}
              {byStatus.today.length === 0 && <li>No tasks for today</li>}
            </ul>
          )}
          <Link to="/today" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
            Open Today →
          </Link>
        </Card>

        <Card title="This week">
          {notionLoading ? (
            <span className="text-muted">…</span>
          ) : (
            <>
              <p className="text-muted">{byStatus["this-week"].length} preparation items</p>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {byStatus["this-week"].slice(0, 3).map((t) => (
                  <li key={t.id}>· {t.title}</li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Diagnostic 360">
          <p className="text-muted">{diagnostic.label}</p>
          {diagnostic.started && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-border">
              <div
                className="h-full bg-accent transition-all"
                style={{
                  width: `${(diagnostic.completedCount / diagnostic.totalModules) * 100}%`,
                }}
              />
            </div>
          )}
          <Link to="/diagnostic" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
            Open Diagnostic →
          </Link>
        </Card>

        <Card title="Evidence">
          {wsLoading ? (
            <span className="text-muted">Loading workspace…</span>
          ) : evidence.length === 0 ? (
            <span className="text-amber-200/90">Insufficient evidence</span>
          ) : (
            <p className="text-muted">
              Validated: {strongEvidence} strong · {mediumEvidence} medium · {weakEvidence} weak
            </p>
          )}
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

        <Card title="Readiness trend">
          {validatedCount === 0 ? (
            <span className="text-amber-200/90">Insufficient evidence — no trend yet</span>
          ) : (
            <ul className="space-y-1 text-xs text-muted">
              {domains
                .filter((d) => !d.insufficientEvidence)
                .slice(0, 4)
                .map((d) => (
                  <li key={d.domain}>
                    {d.label}: {d.score ?? "—"} ({d.trend})
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card title="Needs attention">
          <ul className="space-y-1 text-muted">
            <li>Open weaknesses: {openWeaknesses}</li>
            <li>Scheduled retests: {dueRetests}</li>
            <li>Interview error log (Notion): {errorLogOpen}</li>
          </ul>
        </Card>

        <Card title="Mission pipeline">
          {notionLoading ? (
            <span className="text-muted">…</span>
          ) : (
            <ul className="space-y-1 text-muted">
              {snapshot?.pipeline.map((p) => (
                <li key={`${p.company}-${p.role}`}>
                  {p.company} — {p.role} ({p.status})
                </li>
              ))}
            </ul>
          )}
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
