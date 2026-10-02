import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CockpitSection } from "../../components/cockpit/CockpitSection";
import { DomainReadinessChart } from "../../components/charts/DomainReadinessChart";
import { EvidenceCompositionChart } from "../../components/charts/EvidenceCompositionChart";
import { PipelineFunnel } from "../../components/charts/PipelineFunnel";
import { ProofProgress } from "../../components/charts/ProofProgress";
import { ReadinessGauge } from "../../components/charts/ReadinessGauge";
import { ReadinessTrendChart } from "../../components/charts/ReadinessTrendChart";
import { WeeklyEffortChart } from "../../components/charts/WeeklyEffortChart";
import { LIGHT_DIAGNOSTIC_QUESTIONS } from "../../domain/lightDiagnostic/questionBank";
import { buildCockpitV3Model } from "../../domain/dashboard/buildCockpitV3Model";
import { mergePreparationTasks } from "../../domain/tasks/preparationTasks";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";
import { loadRun } from "../../lib/storage";
import { loadLightDiagnosticSession } from "../../persistence/lightDiagnosticStore";

export function DashboardPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const { snapshot, loading: notionLoading } = useNotionPlanning();
  const [lightProgress, setLightProgress] = useState<{ answered: number; total: number } | null>(null);

  useEffect(() => {
    loadLightDiagnosticSession().then((s) => {
      if (s && s.status !== "complete") {
        setLightProgress({ answered: s.responses.length, total: LIGHT_DIAGNOSTIC_QUESTIONS.length });
      }
    });
  }, []);

  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const allTasks = mergePreparationTasks(notionTasks, workspace?.tasks ?? []);
  const model = useMemo(
    () =>
      buildCockpitV3Model({
        workspace,
        tasks: allTasks,
        snapshot,
        diagnosticRun: loadRun(),
        lightDiagnostic: lightProgress,
      }),
    [workspace, allTasks, snapshot, lightProgress],
  );
  const d = model.dashboard;
  const a = model.analytics;
  const attention = d.attention.slice(0, model.attentionLimit);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col overflow-y-auto px-0.5 md:h-[calc(100dvh-3.25rem)] md:overflow-hidden">
      <header className="mb-2 flex shrink-0 items-end justify-between border-b border-border/40 pb-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Mission 2027</p>
          <h1 className="text-base font-semibold tracking-tight text-accent">Engineering Readiness Cockpit</h1>
          <p className="mt-0.5 text-[10px] text-muted">
            {d.missionWeek && <span>{d.missionWeek}</span>}
            {d.missionPhase && <span className="ml-2">· {d.missionPhase}</span>}
          </p>
        </div>
        <p className="text-right text-[10px] text-muted">
          Target
          <span className="mt-0.5 block text-xs font-medium text-accent">{d.targetProfileLabel}</span>
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-12 md:grid-rows-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.75fr)_auto] lg:gap-x-5">
        <CockpitSection title="Today's focus" className="md:col-span-7 md:row-start-1">
          <p className="text-sm font-semibold leading-snug text-accent">{d.todayFocus.title}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {d.todayFocus.domainLabel && <span>{d.todayFocus.domainLabel} · </span>}
            {d.todayFocus.durationLabel}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] text-muted">{d.todayFocus.reason}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              to={d.todayFocus.href}
              className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-surface hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {d.todayFocus.ctaLabel}
            </Link>
            <span className="text-[10px] tabular-nums text-muted">{d.weekProgress.label}</span>
          </div>
        </CockpitSection>

        <CockpitSection title="Overall readiness" className="md:col-span-5 md:row-start-1">
          {wsLoading ? (
            <p className="text-xs text-muted">Loading…</p>
          ) : (
            <ReadinessGauge
              score={d.overallReadinessScore}
              insufficient={d.overallInsufficient}
              profileLabel={d.targetProfileLabel}
              basis={model.readinessBasis}
              qualitySubtitle={model.readinessSubtitle}
            />
          )}
        </CockpitSection>

        <CockpitSection
          title="Domain readiness"
          className="min-h-0 md:col-span-7 md:row-start-2"
          action={
            <Link to="/readiness" className="text-[10px] text-accent hover:underline">
              View all →
            </Link>
          }
        >
          <div className="max-h-[140px] overflow-y-auto pr-1">
            <DomainReadinessChart rows={model.topDomainBars} />
          </div>
        </CockpitSection>

        <CockpitSection title="Needs attention" className="min-h-0 md:col-span-5 md:row-start-2">
          {attention.length === 0 ? (
            <p className="text-[11px] text-muted">No urgent signals.</p>
          ) : (
            <ul className="max-h-[140px] space-y-1 overflow-y-auto">
              {attention.map((item) => (
                <li key={item.id} className="border-l-2 border-amber-400/40 pl-2">
                  <p className="truncate text-[11px] font-medium text-accent">{item.title}</p>
                  <p className="truncate text-[10px] text-muted">{item.detail}</p>
                  <Link to={item.href} className="text-[10px] text-accent hover:underline">
                    {item.actionLabel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CockpitSection>

        <CockpitSection title="Evidence" className="md:col-span-4 md:row-start-3">
          <EvidenceCompositionChart
            validated={model.evidenceSplit.validated}
            provisional={model.evidenceSplit.provisional}
            basis={model.readinessBasis}
          />
        </CockpitSection>

        <CockpitSection
          title="Readiness trend"
          className="md:col-span-8 md:row-start-3"
          action={
            <Link to="/analytics" className="text-[10px] text-accent hover:underline">
              Analytics →
            </Link>
          }
        >
          <ReadinessTrendChart points={a.profileTrend} hasTrend={a.hasReadinessHistory} />
        </CockpitSection>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:col-span-12 md:row-start-4">
          <CockpitSection title="Proofs">
            {notionLoading ? (
              <p className="text-[10px] text-muted">…</p>
            ) : (
              <ProofProgress summary={model.proofsSummary} nextProofTitle={model.nextProofTitle} />
            )}
          </CockpitSection>
          <CockpitSection title="Pipeline">
            {notionLoading ? (
              <p className="text-[10px] text-muted">…</p>
            ) : (
              <PipelineFunnel
                stages={d.pipelineStages}
                arrowLabel={model.pipelineArrow}
                caption={model.pipelineCaption}
              />
            )}
          </CockpitSection>
          <CockpitSection title="This week">
            <WeeklyEffortChart
              days={a.weeklyEffort.days}
              hasReliableDuration={a.weeklyEffort.hasReliableDuration}
              totalDiagnosticSeconds={model.weeklyDiagnosticSeconds}
            />
          </CockpitSection>
        </div>
      </div>
    </div>
  );
}
