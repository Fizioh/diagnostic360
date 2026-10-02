import type { DiagnosticRun } from "../../types/diagnostic";
import type { NotionPlanningSnapshot } from "../../integrations/notion/types";
import type { EvidenceStrengthTotals } from "../analytics";
import { computeMissionAnalytics, type MissionAnalyticsModel } from "../analytics";
import { computeReadinessBasis, type ReadinessBasis } from "../readiness/readinessBasis";
import type { MissionWorkspaceV1, PreparationTask, ReadinessDomain } from "../types";
import { buildDashboardModel, type DashboardModel } from "./buildDashboardModel";
import {
  isProofCompleteStatus,
  nextEngineeringProof,
  pipelineArrowLabel,
  pipelineStageCaptions,
  readinessQualitySubtitle,
  selectTopDomainBars,
  splitEvidenceTotals,
  sumWeeklyDiagnosticSeconds,
} from "./cockpitSelectors";

export interface ProofsSummary {
  completed: number;
  total: number;
  hasData: boolean;
}

export interface CockpitV3Model {
  dashboard: DashboardModel;
  analytics: MissionAnalyticsModel;
  proofsSummary: ProofsSummary;
  attentionLimit: number;
  readinessBasis: ReadinessBasis;
  readinessSubtitle: string | null;
  topDomainBars: DashboardModel["domainBars"];
  evidenceSplit: { validated: EvidenceStrengthTotals; provisional: EvidenceStrengthTotals };
  weeklyDiagnosticSeconds: number;
  pipelineArrow: string | null;
  pipelineCaption: string | null;
  nextProofTitle: string | null;
}

function proofsSummary(snapshot: NotionPlanningSnapshot | null): ProofsSummary {
  const proofs = snapshot?.engineeringProofs ?? [];
  if (!proofs.length) return { completed: 0, total: 0, hasData: false };
  const doneLike = proofs.filter((p) => isProofCompleteStatus(p.status)).length;
  return { completed: doneLike, total: proofs.length, hasData: true };
}

export function buildCockpitV3Model(input: {
  workspace: MissionWorkspaceV1 | null;
  tasks: PreparationTask[];
  snapshot: NotionPlanningSnapshot | null;
  diagnosticRun: DiagnosticRun | null;
  lightDiagnostic?: { answered: number; total: number } | null;
}): CockpitV3Model {
  const dashboard = buildDashboardModel(input);
  const analytics = computeMissionAnalytics(input.workspace, { tasks: input.tasks });
  const readinessBasis = computeReadinessBasis(input.workspace);
  const evidenceSplit = splitEvidenceTotals(input.workspace?.evidence ?? []);
  const stages = dashboard.pipelineStages;

  return {
    dashboard,
    analytics,
    proofsSummary: proofsSummary(input.snapshot),
    attentionLimit: 5,
    readinessBasis,
    readinessSubtitle: readinessQualitySubtitle(input.workspace, readinessBasis),
    topDomainBars: selectTopDomainBars(dashboard),
    evidenceSplit,
    weeklyDiagnosticSeconds: sumWeeklyDiagnosticSeconds(analytics.weeklyEffort.days),
    pipelineArrow: pipelineArrowLabel(stages),
    pipelineCaption: pipelineStageCaptions(stages),
    nextProofTitle: nextEngineeringProof(dashboard.engineeringProofs),
  };
}

export type { ReadinessDomain };
