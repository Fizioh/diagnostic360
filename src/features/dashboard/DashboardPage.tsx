import { Link } from "react-router-dom";
import { PipelineMiniFunnel } from "../../components/charts/PipelineMiniFunnel";
import { ProofProgressMini } from "../../components/charts/ProofProgressMini";
import { ReadinessGauge } from "../../components/charts/ReadinessGauge";
import { ReadinessTrendChart } from "../../components/charts/ReadinessTrendChart";
import { StrengthDonut } from "../../components/charts/StrengthDonut";
import { WeeklySparkBars } from "../../components/charts/WeeklySparkBars";
import { DomainBar } from "../../components/ui/DomainBar";
import { CompactPanel } from "../../components/ui/CompactPanel";
import { buildCockpitV3Model } from "../../domain/dashboard/buildCockpitV3Model";
import { mergePreparationTasks } from "../../domain/tasks/preparationTasks";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";
import { loadRun } from "../../lib/storage";

export function DashboardPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const { snapshot, loading: notionLoading } = useNotionPlanning();

  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const allTasks = mergePreparationTasks(notionTasks, workspace?.tasks ?? []);
  const model = buildCockpitV3Model({
    workspace,
    tasks: allTasks,
    snapshot,
    diagnosticRun: loadRun(),
  });
  const d = model.dashboard;
  const a = model.analytics;
  const attention = d.attention.slice(0, model.attentionLimit);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-2 pb-4 lg:max-h-[calc(100dvh-4.25rem)] lg:gap-2.5">
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-accent md:text-xl">Mission cockpit</h1>
          <p className="text-[11px] text-muted">
            {d.missionPhase && <span>{d.missionPhase}</span>}
            {d.missionWeek && <span className="ml-2">· {d.missionWeek}</span>}
            <span className="ml-2">· {d.targetProfileLabel}</span>
          </p>
        </div>
        <Link to="/analytics" className="text-[11px] font-medium text-accent hover:underline">
          Full analytics →
        </Link>
      </header>

      <div className="grid flex-1 gap-2 lg:grid-cols-12 lg:grid-rows-[auto_auto_minmax(0,1fr)_auto] lg:gap-2.5">
        <CompactPanel title="Today's focus" className="lg:col-span-7 lg:row-start-1">
          <p className="text-base font-semibold leading-snug text-accent">{d.todayFocus.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">{d.todayFocus.reason}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {d.todayFocus.domainLabel && (
              <span className="rounded border border-border/70 px-1.5 py-0.5 text-[10px] text-muted">
                {d.todayFocus.domainLabel}
              </span>
            )}
            <span className="text-[10px] text-muted">{d.todayFocus.durationLabel}</span>
            <Link
              to={d.todayFocus.href}
              className="ml-auto rounded bg-accent px-2.5 py-1 text-xs font-semibold text-surface hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {d.todayFocus.ctaLabel}
            </Link>
          </div>
        </CompactPanel>

        <CompactPanel title="Overall readiness" className="lg:col-span-5 lg:row-start-1">
          {wsLoading ? (
            <p className="text-xs text-muted">Loading…</p>
          ) : (
            <ReadinessGauge
              score={d.overallReadinessScore}
              insufficient={d.overallInsufficient}
              profileLabel={d.targetProfileLabel}
              basis={model.readinessBasis}
            />
          )}
        </CompactPanel>

        <CompactPanel
          title="Domain readiness"
          className="lg:col-span-7 lg:row-start-2 lg:max-h-[220px] lg:overflow-y-auto"
          action={
            <Link to="/readiness" className="text-[10px] text-accent hover:underline">
              All →
            </Link>
          }
        >
          <div className="space-y-1.5">
            {d.domainBars.map((row) => (
              <DomainBar key={row.domain} label={row.label} score={row.score} insufficient={row.insufficient} />
            ))}
          </div>
        </CompactPanel>

        <CompactPanel title="Needs attention" className="lg:col-span-5 lg:row-start-2">
          {attention.length === 0 ? (
            <p className="text-xs text-muted">Nothing urgent.</p>
          ) : (
            <ul className="space-y-1.5">
              {attention.map((item) => (
                <li key={item.id} className="rounded border border-border/60 px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-accent">{item.title}</p>
                  <Link to={item.href} className="text-[10px] text-accent hover:underline">
                    {item.actionLabel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {d.attention.length > model.attentionLimit && (
            <Link to="/remediation" className="mt-1 inline-block text-[10px] text-muted hover:text-accent">
              +{d.attention.length - model.attentionLimit} more →
            </Link>
          )}
        </CompactPanel>

        <CompactPanel
          title={
            model.readinessBasis === "provisional"
              ? "Evidence composition (Provisional)"
              : "Evidence composition"
          }
          className="lg:col-span-4 lg:row-start-3"
          action={
            <Link to="/analytics" className="text-[10px] text-accent hover:underline">
              History →
            </Link>
          }
        >
          <StrengthDonut totals={a.evidenceStrengthTotals} />
        </CompactPanel>

        <CompactPanel title="Readiness trend" className="lg:col-span-8 lg:row-start-3">
          <ReadinessTrendChart points={a.profileTrend} hasTrend={a.hasReadinessHistory} />
        </CompactPanel>

        <div className="grid gap-2 sm:grid-cols-3 lg:col-span-12 lg:row-start-4">
          <CompactPanel title="Engineering proofs">
            {notionLoading ? <p className="text-xs text-muted">…</p> : <ProofProgressMini summary={model.proofsSummary} />}
          </CompactPanel>
          <CompactPanel title="Mission pipeline">
            {notionLoading ? (
              <p className="text-xs text-muted">…</p>
            ) : (
              <PipelineMiniFunnel stages={d.pipelineStages} />
            )}
          </CompactPanel>
          <CompactPanel title="Weekly effort">
            <WeeklySparkBars days={a.weeklyEffort.days} hasReliableDuration={a.weeklyEffort.hasReliableDuration} />
            <p className="mt-1 text-[10px] text-muted">{d.weekProgress.label}</p>
          </CompactPanel>
        </div>
      </div>
    </div>
  );
}
