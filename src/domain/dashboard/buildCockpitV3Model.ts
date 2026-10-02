import type { DiagnosticRun } from "../../types/diagnostic";
import type { NotionPlanningSnapshot } from "../../integrations/notion/types";
import { computeMissionAnalytics, type MissionAnalyticsModel } from "../analytics";
import type { MissionWorkspaceV1, PreparationTask } from "../types";
import { buildDashboardModel, type DashboardModel } from "./buildDashboardModel";

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
}

function isProofCompleteStatus(status: string): boolean {
  const s = status.trim().toLowerCase();
  if (!s || s.includes("incomplete") || s.includes("not done") || s.startsWith("undone")) return false;
  return /^(done|complete|completed|published|shipped|live)$/.test(s);
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
}): CockpitV3Model {
  const dashboard = buildDashboardModel(input);
  const analytics = computeMissionAnalytics(input.workspace, { tasks: input.tasks });
  return {
    dashboard,
    analytics,
    proofsSummary: proofsSummary(input.snapshot),
    attentionLimit: 4,
  };
}
