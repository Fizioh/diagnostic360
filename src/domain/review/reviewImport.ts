import type { Confidence, ModuleId } from "../../types/diagnostic";
import {
  applyExternalReview,
  type DiagnosticExternalReviewV1,
  parseExternalReviewJson,
  weaknessLines,
} from "../diagnostic/externalReview";
import { computeAllDomains } from "../readiness/computeReadiness";
import {
  computeProfileReadiness,
  DEFAULT_TARGET_PROFILE_ID,
} from "../readiness/targetProfiles";
import type { MissionWorkspaceV1, ReadinessDomain } from "../types";

export { parseExternalReviewJson, type DiagnosticExternalReviewV1 };

export interface ReviewImportPreview {
  reviewId: string;
  runId: string;
  reviewedAt: string;
  alreadyApplied: boolean;
  evidenceToAdd: number;
  weaknessesToAdd: number;
  moduleOutcomes: { moduleId: string; outcome: string }[];
  errors: string[];
}

export function normalizeReviewId(review: DiagnosticExternalReviewV1): string {
  if (review.reviewId?.trim()) return review.reviewId.trim();
  return `${review.runId}:${review.reviewedAt}`;
}

export function hasReviewImportArtifacts(workspace: MissionWorkspaceV1, reviewId: string): boolean {
  if ((workspace.appliedReviews ?? []).some((r) => r.reviewId === reviewId)) return true;
  if ((workspace.readinessSnapshots ?? []).some((s) => s.sourceReviewId === reviewId)) return true;
  const prefix = `ev-${reviewId}-`;
  if (workspace.evidence.some((e) => e.sourceReviewId === reviewId || e.id.startsWith(prefix))) return true;
  const wkPrefix = `wk-${reviewId}-`;
  if (workspace.weaknesses.some((w) => w.id.startsWith(wkPrefix))) return true;
  return false;
}

export function isReviewAlreadyApplied(workspace: MissionWorkspaceV1, reviewId: string): boolean {
  return hasReviewImportArtifacts(workspace, reviewId);
}

function backfillAppliedReviewRecord(
  workspace: MissionWorkspaceV1,
  review: DiagnosticExternalReviewV1,
  reviewId: string,
): MissionWorkspaceV1 {
  if ((workspace.appliedReviews ?? []).some((r) => r.reviewId === reviewId)) return workspace;
  return {
    ...workspace,
    appliedReviews: [
      ...(workspace.appliedReviews ?? []),
      {
        reviewId,
        runId: review.runId,
        reviewedAt: review.reviewedAt,
        importedAt: new Date().toISOString(),
      },
    ],
  };
}

function countWouldAdd(review: DiagnosticExternalReviewV1): { evidence: number; weaknesses: number } {
  let evidence = 0;
  let weaknesses = 0;
  for (const mod of review.modules) {
    if (mod.outcome === "validated-pass" || mod.outcome === "validated-partial") evidence += 1;
    for (const entry of weaknessLines(mod)) {
      if (entry.summary?.trim()) weaknesses += 1;
    }
  }
  return { evidence, weaknesses };
}

export function previewReviewImport(
  workspace: MissionWorkspaceV1,
  raw: string,
  options?: { expectedRunId?: string },
): ReviewImportPreview {
  const errors: string[] = [];
  let review: DiagnosticExternalReviewV1;
  try {
    review = parseExternalReviewJson(raw);
  } catch (e) {
    return {
      reviewId: "",
      runId: "",
      reviewedAt: "",
      alreadyApplied: false,
      evidenceToAdd: 0,
      weaknessesToAdd: 0,
      moduleOutcomes: [],
      errors: [e instanceof Error ? e.message : "Invalid review"],
    };
  }
  if (options?.expectedRunId && review.runId !== options.expectedRunId) {
    errors.push(`runId mismatch: review targets ${review.runId}, expected ${options.expectedRunId}`);
  }
  const reviewId = normalizeReviewId(review);
  const alreadyApplied = isReviewAlreadyApplied(workspace, reviewId);
  const counts = countWouldAdd(review);
  return {
    reviewId,
    runId: review.runId,
    reviewedAt: review.reviewedAt,
    alreadyApplied,
    evidenceToAdd: alreadyApplied ? 0 : counts.evidence,
    weaknessesToAdd: alreadyApplied ? 0 : counts.weaknesses,
    moduleOutcomes: review.modules.map((m) => ({ moduleId: m.moduleId, outcome: m.outcome })),
    errors,
  };
}

function appendReadinessSnapshot(
  workspace: MissionWorkspaceV1,
  review: DiagnosticExternalReviewV1,
  reviewId: string,
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const domains = computeAllDomains(workspace.evidence, new Date(review.reviewedAt));
  const domainScores: Partial<Record<ReadinessDomain, number>> = {};
  for (const d of domains) {
    if (!d.insufficientEvidence && d.score != null) domainScores[d.domain] = d.score;
  }
  const profile = computeProfileReadiness(DEFAULT_TARGET_PROFILE_ID, workspace.evidence);
  const snapshot = {
    id: crypto.randomUUID(),
    at,
    sourceReviewId: reviewId,
    runId: review.runId,
    profileScore: profile.insufficientEvidence ? null : profile.score,
    domainScores,
    evidenceCount: workspace.evidence.filter((e) => e.validatedAt).length,
    openWeaknesses: workspace.weaknesses.filter((w) => w.status !== "mastered").length,
    diagnosticSeconds: null as number | null,
  };
  return {
    ...workspace,
    readinessSnapshots: [...(workspace.readinessSnapshots ?? []), snapshot],
  };
}

export function importExternalReviewToWorkspace(
  workspace: MissionWorkspaceV1,
  review: DiagnosticExternalReviewV1,
  options?: {
    moduleSelfConfidence?: Partial<Record<ModuleId, Confidence>>;
    diagnosticSeconds?: number | null;
  },
): { workspace: MissionWorkspaceV1; applied: boolean; message: string } {
  const reviewId = normalizeReviewId(review);
  if (isReviewAlreadyApplied(workspace, reviewId)) {
    return {
      workspace: backfillAppliedReviewRecord(workspace, review, reviewId),
      applied: false,
      message: "Review already imported (same reviewId). No changes applied.",
    };
  }

  let next = applyExternalReview(workspace, review, {
    moduleSelfConfidence: options?.moduleSelfConfidence,
    reviewId,
    runId: review.runId,
  });

  next = {
    ...next,
    appliedReviews: [
      ...(next.appliedReviews ?? []),
      {
        reviewId,
        runId: review.runId,
        reviewedAt: review.reviewedAt,
        importedAt: new Date().toISOString(),
      },
    ],
  };

  next = appendReadinessSnapshot(next, review, reviewId);
  const snapshots = next.readinessSnapshots ?? [];
  if (options?.diagnosticSeconds != null && snapshots.length > 0) {
    const snaps = [...snapshots];
    const last = snaps[snaps.length - 1];
    snaps[snaps.length - 1] = { ...last, diagnosticSeconds: options.diagnosticSeconds };
    next = { ...next, readinessSnapshots: snaps };
  }

  return {
    workspace: next,
    applied: true,
    message: "Review imported — evidence, weaknesses, and readiness snapshot updated.",
  };
}

export function importExternalReviewJson(
  workspace: MissionWorkspaceV1,
  raw: string,
  options?: {
    moduleSelfConfidence?: Partial<Record<ModuleId, Confidence>>;
    expectedRunId?: string;
    diagnosticSeconds?: number | null;
  },
): { workspace: MissionWorkspaceV1; applied: boolean; message: string; preview: ReviewImportPreview } {
  const previewBefore = previewReviewImport(workspace, raw, { expectedRunId: options?.expectedRunId });
  if (previewBefore.errors.length) {
    throw new Error(previewBefore.errors.join("; "));
  }
  const review = parseExternalReviewJson(raw);
  const result = importExternalReviewToWorkspace(workspace, review, options);
  const preview = previewReviewImport(result.workspace, raw, { expectedRunId: options?.expectedRunId });
  return { ...result, preview };
}
