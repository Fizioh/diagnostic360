import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../../app/i18n/LocaleProvider";
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
  const { t } = useLocale();
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
  const weekPct =
    d.weekProgress.planned > 0 ? Math.round((d.weekProgress.completed / d.weekProgress.planned) * 100) : 0;

  return (
    <div className="cockpit-scene flex w-full min-w-0 flex-col overflow-y-auto md:h-[calc(100dvh-2rem)] md:overflow-hidden">
      <div
        className="pointer-events-none fixed right-[4%] top-8 hidden h-52 w-52 rounded-full bg-gradient-to-br from-neon-blue/25 to-neon-cyan/10 blur-2xl md:block"
        aria-hidden
      />
      <header className="relative mb-3 flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-neon-blue/15 pb-2.5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan/80">{t.brand}</p>
          <h1 className="bg-gradient-to-r from-accent to-neon-cyan/90 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
            {t.cockpit.title}
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-muted">
            {d.missionWeek && <span>{d.missionWeek}</span>}
            {d.missionPhase && <span className="ml-2 text-muted/80">· {d.missionPhase}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/diagnostic/light"
            className="rounded-lg border border-neon-cyan/45 bg-neon-cyan/10 px-3 py-2 text-xs font-semibold text-neon-cyan shadow-neon-sm transition hover:border-neon-cyan/70 hover:bg-neon-cyan/15"
          >
            {t.quickTest} →
          </Link>
          <div className="cockpit-target-pill">
            <span className="text-[10px] uppercase tracking-wide text-muted">{t.cockpit.target}</span>
            <span className="font-medium text-accent">{d.targetProfileLabel}</span>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(5.5rem,auto)] md:gap-3">
        <CockpitSection title={t.cockpit.todaysFocus} variant="focus" className="md:col-span-7 md:row-start-1">
          <p className="text-[15px] font-semibold leading-snug text-accent">{d.todayFocus.title}</p>
          <p className="mt-1 text-xs text-muted">
            {d.todayFocus.domainLabel && <span className="text-accent/80">{d.todayFocus.domainLabel}</span>}
            {d.todayFocus.domainLabel && d.todayFocus.durationLabel && <span> · </span>}
            <span>{d.todayFocus.durationLabel}</span>
          </p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{d.todayFocus.reason}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Link to={d.todayFocus.href} className="cockpit-btn-primary">
              {d.todayFocus.ctaLabel}
            </Link>
            <div className="min-w-[8rem] flex-1">
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
                <span>{t.cockpit.weeklyPrep}</span>
                <span className="tabular-nums">{d.weekProgress.label}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-cyan shadow-[0_0_12px_rgba(46,230,255,0.45)] transition-all"
                  style={{ width: `${weekPct}%` }}
                />
              </div>
            </div>
          </div>
        </CockpitSection>

        <CockpitSection title={t.cockpit.overallReadiness} className="md:col-span-5 md:row-start-1">
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
          title={t.cockpit.domainReadiness}
          className="min-h-0 md:col-span-7 md:row-start-2"
          action={
            <Link to="/readiness" className="cockpit-link text-[11px]">
              {t.cockpit.viewAll}
            </Link>
          }
        >
          <DomainReadinessChart rows={model.topDomainBars} />
        </CockpitSection>

        <CockpitSection title={t.cockpit.needsAttention} className="min-h-0 md:col-span-5 md:row-start-2">
          {attention.length === 0 ? (
            <div className="relative overflow-hidden rounded-lg border border-signal/25 bg-signal/5 px-2.5 py-4 text-center shadow-neon-green">
              <p className="text-2xl text-signal" aria-hidden>
                ✓
              </p>
              <p className="text-xs font-medium text-accent">{t.cockpit.allClear}</p>
              <p className="mt-0.5 text-[11px] text-muted">{t.cockpit.noSignals}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {attention.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-amber-400/20 bg-surface/40 px-2 py-1.5 pl-2.5"
                  style={{ borderLeftWidth: 3 }}
                >
                  <p className="truncate text-xs font-medium text-accent">{item.title}</p>
                  <p className="truncate text-[11px] text-muted">{item.detail}</p>
                  <Link to={item.href} className="text-[11px] font-medium text-signal hover:underline">
                    {item.actionLabel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CockpitSection>

        <CockpitSection title={t.cockpit.evidence} className="md:col-span-4 md:row-start-3">
          <EvidenceCompositionChart
            validated={model.evidenceSplit.validated}
            provisional={model.evidenceSplit.provisional}
            basis={model.readinessBasis}
          />
        </CockpitSection>

        <CockpitSection
          title={t.cockpit.readinessTrend}
          className="md:col-span-8 md:row-start-3"
          action={
            <Link to="/analytics" className="cockpit-link text-[11px]">
              {t.cockpit.analytics}
            </Link>
          }
        >
          <ReadinessTrendChart points={a.profileTrend} hasTrend={a.hasReadinessHistory} />
        </CockpitSection>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:col-span-12 md:row-start-4 md:gap-3">
          <CockpitSection title={t.cockpit.proofs} variant="kpi">
            {notionLoading ? (
              <p className="text-[11px] text-muted">…</p>
            ) : (
              <ProofProgress summary={model.proofsSummary} nextProofTitle={model.nextProofTitle} />
            )}
          </CockpitSection>
          <CockpitSection title={t.cockpit.pipeline} variant="kpi">
            {notionLoading ? (
              <p className="text-[11px] text-muted">…</p>
            ) : (
              <PipelineFunnel
                stages={d.pipelineStages}
                arrowLabel={model.pipelineArrow}
                caption={model.pipelineCaption}
              />
            )}
          </CockpitSection>
          <CockpitSection title={t.cockpit.thisWeek} variant="kpi">
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
