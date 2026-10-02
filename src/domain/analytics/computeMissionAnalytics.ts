import type { MissionWorkspaceV1, PreparationTask } from "../types";
import {
  aggregateEvidenceCompositionByDomain,
  aggregateEvidenceStrengthTotals,
  buildCalibrationPoints,
  buildReadinessHistoryFromSnapshots,
  buildWeaknessBurndownFromSnapshots,
  buildWeeklyEffortSeries,
  latestRecordedDiagnosticSeconds,
  type CalibrationPoint,
  type EvidenceCompositionRow,
  type EvidenceStrengthTotals,
  type ReadinessHistoryPoint,
  type WeeklyEffortSeries,
  type WeaknessBurndownPoint,
} from "./missionAnalyticsData";

export type {
  CalibrationPoint,
  EvidenceCompositionRow,
  EvidenceStrengthTotals,
  ReadinessHistoryPoint,
  WeeklyEffortDay,
  WeeklyEffortSeries,
  WeaknessBurndownPoint,
} from "./missionAnalyticsData";

export interface TimeInvestedSummary {
  diagnosticSeconds: number | null;
  snapshotCount: number;
  message: string;
}

export interface MissionAnalyticsModel {
  hasReadinessHistory: boolean;
  readinessHistoryEmptyMessage: string;
  readinessHistory: ReadinessHistoryPoint[];
  profileTrend: { at: string; score: number | null }[];
  evidenceStrengthTotals: EvidenceStrengthTotals;
  evidenceComposition: EvidenceCompositionRow[];
  evidenceCompositionEmpty: boolean;
  weaknessBurndown: WeaknessBurndownPoint[];
  weaknessBurndownEmpty: boolean;
  calibration: CalibrationPoint[];
  calibrationEmpty: boolean;
  weeklyEffort: WeeklyEffortSeries;
  timeInvested: TimeInvestedSummary;
  appliedReviewCount: number;
  validatedEvidenceCount: number;
}

export function computeMissionAnalytics(
  workspace: MissionWorkspaceV1 | null,
  options?: { tasks?: PreparationTask[]; asOf?: Date },
): MissionAnalyticsModel {
  const evidence = workspace?.evidence ?? [];
  const snapshots = workspace?.readinessSnapshots ?? [];
  const tasks = options?.tasks ?? workspace?.tasks ?? [];
  const asOf = options?.asOf ?? new Date();

  const validated = evidence.filter((e) => e.validatedAt);
  const readinessHistory = buildReadinessHistoryFromSnapshots(snapshots);
  const profileTrend = readinessHistory.map((p) => ({ at: p.at, score: p.profileScore }));
  const hasReadinessHistory = snapshots.length >= 2;

  const diagnosticSeconds = latestRecordedDiagnosticSeconds(snapshots);
  const weeklyEffort = buildWeeklyEffortSeries(workspace, tasks, asOf);
  const calibration = buildCalibrationPoints(evidence, asOf);

  return {
    hasReadinessHistory,
    readinessHistoryEmptyMessage:
      snapshots.length === 0
        ? "Import at least one external review to capture readiness snapshots."
        : "Import another review after remediation to see readiness trend.",
    readinessHistory,
    profileTrend,
    evidenceStrengthTotals: aggregateEvidenceStrengthTotals(evidence),
    evidenceComposition: aggregateEvidenceCompositionByDomain(evidence),
    evidenceCompositionEmpty: validated.length === 0,
    weaknessBurndown: buildWeaknessBurndownFromSnapshots(snapshots),
    weaknessBurndownEmpty: snapshots.length === 0,
    calibration,
    calibrationEmpty: calibration.length === 0,
    weeklyEffort,
    timeInvested: {
      diagnosticSeconds,
      snapshotCount: snapshots.length,
      message:
        diagnosticSeconds != null
          ? "From diagnostic run elapsed time recorded at review import."
          : "No reliable diagnostic duration yet — complete a session and import a review.",
    },
    appliedReviewCount: workspace?.appliedReviews?.length ?? 0,
    validatedEvidenceCount: validated.length,
  };
}
