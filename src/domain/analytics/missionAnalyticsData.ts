import { computeAllDomains } from "../readiness/computeReadiness";
import type {
  EvidenceItem,
  EvidenceStrength,
  MissionWorkspaceV1,
  PreparationTask,
  ReadinessDomain,
  ReadinessSnapshotV1,
} from "../types";

export interface EvidenceStrengthTotals {
  strong: number;
  medium: number;
  weak: number;
  total: number;
}

export interface EvidenceCompositionRow {
  domain: ReadinessDomain;
  strong: number;
  medium: number;
  weak: number;
  total: number;
}

export interface ReadinessHistoryPoint {
  at: string;
  profileScore: number | null;
  evidenceCount: number;
  openWeaknesses: number;
  sourceReviewId: string;
  runId: string;
}

export interface WeeklyEffortDay {
  date: string;
  diagnosticSeconds: number | null;
  tasksCompleted: number;
  hasReliableDuration: boolean;
}

export interface WeeklyEffortSeries {
  days: WeeklyEffortDay[];
  hasReliableDuration: boolean;
  emptyMessage: string;
}

export interface CalibrationPoint {
  domain: ReadinessDomain;
  label: string;
  calibration: "overconfident" | "underconfident" | "aligned" | null;
  score: number | null;
  confidence: number | null;
}

export interface WeaknessBurndownPoint {
  at: string;
  openWeaknesses: number;
  sourceReviewId: string;
}

function validatedEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter((e) => e.validatedAt);
}

export function aggregateEvidenceStrengthTotals(evidence: EvidenceItem[]): EvidenceStrengthTotals {
  const totals: EvidenceStrengthTotals = { strong: 0, medium: 0, weak: 0, total: 0 };
  for (const e of validatedEvidence(evidence)) {
    totals[e.strength as EvidenceStrength] += 1;
    totals.total += 1;
  }
  return totals;
}

export function aggregateEvidenceCompositionByDomain(evidence: EvidenceItem[]): EvidenceCompositionRow[] {
  const map = new Map<ReadinessDomain, EvidenceCompositionRow>();
  for (const e of validatedEvidence(evidence)) {
    let row = map.get(e.domain);
    if (!row) {
      row = { domain: e.domain, strong: 0, medium: 0, weak: 0, total: 0 };
      map.set(e.domain, row);
    }
    row[e.strength as EvidenceStrength] += 1;
    row.total += 1;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function buildReadinessHistoryFromSnapshots(snapshots: ReadinessSnapshotV1[]): ReadinessHistoryPoint[] {
  return [...snapshots]
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((s) => ({
      at: s.at,
      profileScore: s.profileScore,
      evidenceCount: s.evidenceCount,
      openWeaknesses: s.openWeaknesses,
      sourceReviewId: s.sourceReviewId,
      runId: s.runId,
    }));
}

export function buildWeaknessBurndownFromSnapshots(snapshots: ReadinessSnapshotV1[]): WeaknessBurndownPoint[] {
  return buildReadinessHistoryFromSnapshots(snapshots).map((p) => ({
    at: p.at,
    openWeaknesses: p.openWeaknesses,
    sourceReviewId: p.sourceReviewId,
  }));
}

export function buildCalibrationPoints(evidence: EvidenceItem[], asOf = new Date()): CalibrationPoint[] {
  return computeAllDomains(evidence, asOf)
    .filter((d) => !d.insufficientEvidence && d.calibration != null)
    .map((d) => ({
      domain: d.domain,
      label: d.label,
      calibration: d.calibration,
      score: d.score,
      confidence: d.confidence,
    }));
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildWeeklyEffortSeries(
  workspace: MissionWorkspaceV1 | null,
  tasks: PreparationTask[],
  now = new Date(),
): WeeklyEffortSeries {
  const snapshots = workspace?.readinessSnapshots ?? [];
  const applied = workspace?.appliedReviews ?? [];
  const days: WeeklyEffortDay[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - offset);
    const key = dayKey(d);

    let diagnosticSeconds: number | null = null;
    for (const snap of snapshots) {
      const snapDay = snap.at.slice(0, 10);
      const importDay = applied.find((r) => r.reviewId === snap.sourceReviewId)?.importedAt.slice(0, 10);
      const matchDay = importDay ?? snapDay;
      if (matchDay === key && snap.diagnosticSeconds != null && snap.diagnosticSeconds > 0) {
        diagnosticSeconds = (diagnosticSeconds ?? 0) + snap.diagnosticSeconds;
      }
    }

    const tasksCompleted = tasks.filter((t) => t.completedAt?.slice(0, 10) === key).length;
    days.push({
      date: key,
      diagnosticSeconds,
      tasksCompleted,
      hasReliableDuration: diagnosticSeconds != null && diagnosticSeconds > 0,
    });
  }

  const hasReliableDuration = days.some((d) => d.hasReliableDuration);
  return {
    days,
    hasReliableDuration,
    emptyMessage: hasReliableDuration
      ? "Diagnostic duration recorded on review import days."
      : "No reliable duration by day yet — import a review after completing Diagnostic 360.",
  };
}

export function latestRecordedDiagnosticSeconds(snapshots: ReadinessSnapshotV1[]): number | null {
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const s = snapshots[i].diagnosticSeconds;
    if (s != null && s > 0) return s;
  }
  return null;
}
