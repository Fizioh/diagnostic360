import { Link } from "react-router-dom";
import { DomainBar } from "../../components/ui/DomainBar";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { buildDashboardModel } from "../../domain/dashboard/buildDashboardModel";
import { mergePreparationTasks, tasksByStatus } from "../../domain/tasks/preparationTasks";
import { useDiagnosticSummary } from "../../hooks/useDiagnosticSummary";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";
import { loadRun } from "../../lib/storage";

export function DashboardPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const { snapshot, loading: notionLoading } = useNotionPlanning();
  const diagnostic = useDiagnosticSummary();

  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const allTasks = mergePreparationTasks(notionTasks, workspace?.tasks ?? []);
  const model = buildDashboardModel({
    workspace,
    tasks: allTasks,
    snapshot,
    diagnosticRun: loadRun(),
  });

  const weekDone = tasksByStatus(allTasks).done.length;

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Mission 2027</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-accent md:text-4xl">
            Engineering performance cockpit
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Evidence-backed readiness — not task completion theater.
          </p>
        </div>
        <dl className="flex flex-wrap gap-4 text-xs text-muted">
          {model.missionPhase && (
            <div>
              <dt className="font-mono uppercase tracking-wide">Phase</dt>
              <dd className="mt-0.5 text-sm text-accent">{model.missionPhase}</dd>
            </div>
          )}
          {model.missionWeek && (
            <div>
              <dt className="font-mono uppercase tracking-wide">Week</dt>
              <dd className="mt-0.5 text-sm text-accent">{model.missionWeek}</dd>
            </div>
          )}
          <div>
            <dt className="font-mono uppercase tracking-wide">Target profile</dt>
            <dd className="mt-0.5 text-sm text-accent">{model.targetProfileLabel}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 xl:col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-panel via-panel to-surface p-6 shadow-lg shadow-black/25 md:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Today&apos;s focus</p>
            <h2 className="mt-2 text-2xl font-semibold leading-snug text-accent md:text-3xl">{model.todayFocus.title}</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
              {model.todayFocus.domainLabel && (
                <span className="rounded-full border border-border/80 px-2.5 py-0.5 font-mono text-[11px] text-accent/90">
                  {model.todayFocus.domainLabel}
                </span>
              )}
              <span className="font-mono text-[11px]">{model.todayFocus.durationLabel}</span>
            </div>
            <p className="mt-4 max-w-lg text-sm text-muted">{model.todayFocus.reason}</p>
            <Link
              to={model.todayFocus.href}
              className="mt-6 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {model.todayFocus.ctaLabel}
            </Link>
            <div className="mt-8 border-t border-border/50 pt-4">
              <p className="text-xs text-muted">This week</p>
              <p className="mt-1 font-mono text-sm text-accent">
                {weekDone} completed · {model.weekProgress.label}
              </p>
              <div className="mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-border/80">
                <div
                  className="h-full bg-accent/70"
                  style={{
                    width: `${model.weekProgress.planned ? Math.min(100, (model.weekProgress.completed / model.weekProgress.planned) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 xl:col-span-4">
          <Panel title="Validated readiness" subtitle="Weighted profile score from evidence">
            {wsLoading ? (
              <p className="text-sm text-muted">Loading workspace…</p>
            ) : model.overallInsufficient ? (
              <EmptyState
                title="No validated baseline yet"
                description="Complete Diagnostic 360 and import a structured review to establish your first readiness baseline."
                actionLabel="Start Diagnostic"
                actionHref="/diagnostic"
              />
            ) : (
              <p className="font-mono text-5xl font-medium tabular-nums tracking-tight text-accent">
                {model.overallReadinessScore}
              </p>
            )}
            <Link to="/readiness" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
              Open readiness drill-down →
            </Link>
          </Panel>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <Panel title="Domain readiness" subtitle="Compact view — scores only when evidence validates">
            <div className="space-y-3">
              {model.domainBars.map((row) => (
                <DomainBar key={row.domain} label={row.label} score={row.score} insufficient={row.insufficient} />
              ))}
            </div>
          </Panel>
        </section>

        <section className="lg:col-span-5">
          <Panel title="Needs attention" subtitle="Actionable only">
            {model.attention.length === 0 ? (
              <EmptyState
                title="Nothing urgent"
                description="Weaknesses, overdue retests, and calibration gaps will appear here."
                actionLabel="View remediation"
                actionHref="/remediation"
              />
            ) : (
              <ul className="space-y-3">
                {model.attention.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border/70 bg-surface/30 px-3 py-2.5">
                    <p className="text-sm font-medium text-accent">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
                    <Link to={item.href} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
                      {item.actionLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <Panel title="Recent validated evidence" subtitle="Strength · domain · date · impact">
            {model.evidenceFeed.length === 0 ? (
              <EmptyState
                title="No validated evidence yet"
                description="Import a diagnostic review or pass a retest to populate your evidence feed."
                actionLabel="Open Diagnostic"
                actionHref="/diagnostic"
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {model.evidenceFeed.map((row) => (
                  <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-accent">{row.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">
                        {row.strength} · {row.domainLabel} · {new Date(row.validatedAt).toLocaleDateString()} ·{" "}
                        {row.impactLabel}
                      </p>
                    </div>
                    <Link
                      to={`/readiness?domain=${row.domain}`}
                      className="shrink-0 text-xs font-medium text-accent hover:underline"
                    >
                      Explain
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        <section>
          <Panel title="Engineering proofs" subtitle="Public assets in progress">
            {notionLoading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : model.engineeringProofs.length === 0 ? (
              <EmptyState
                title="No proofs tracked"
                description="Import planning data or add proofs in your workspace backup to track README, ADRs, OSS, and labs."
                actionLabel="Data & import"
                actionHref="/data"
              />
            ) : (
              <ul className="space-y-2 text-sm">
                {model.engineeringProofs.map((p) => (
                  <li key={p.title} className="flex justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                    <span className="text-accent">{p.title}</span>
                    <span className="font-mono text-[10px] text-muted">{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Mission pipeline" subtitle="Application funnel">
          {notionLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : model.pipelineStages.length === 0 ? (
            <EmptyState
              title="Pipeline empty"
              description="Add pipeline entries via planning import to visualize application stages."
              actionHref="/data"
              actionLabel="Import planning"
            />
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              {model.pipelineStages.map((stage, i) => (
                <div key={stage.status} className="flex items-end gap-2">
                  <div
                    className="flex min-w-[4.5rem] flex-col items-center rounded-md border border-border/80 bg-surface/40 px-2 py-2"
                    style={{ minHeight: `${48 + stage.count * 12}px` }}
                  >
                    <span className="font-mono text-lg text-accent">{stage.count}</span>
                    <span className="mt-1 text-center text-[10px] leading-tight text-muted">{stage.status}</span>
                  </div>
                  {i < model.pipelineStages.length - 1 && (
                    <span className="pb-4 text-muted" aria-hidden>
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Readiness evolution" subtitle="Historical snapshots">
          {model.hasTrendHistory ? null : (
            <EmptyState
              title="Trend history not available yet"
              description="Readiness snapshots over time will appear here once you accumulate validated evidence across multiple review cycles."
              actionLabel="Run Diagnostic 360"
              actionHref="/diagnostic"
            />
          )}
        </Panel>
      </div>

      {!diagnostic.started && (
        <p className="text-center text-xs text-muted">
          Diagnostic progress: not started —{" "}
          <Link to="/diagnostic" className="text-accent hover:underline">
            begin baseline
          </Link>
        </p>
      )}
    </div>
  );
}
