import { describe, expect, it } from "vitest";
import { buildDiagnosticExportV1 } from "../diagnostic/diagnosticExport";
import { applyExternalReview, buildReviewTemplate } from "../diagnostic/externalReview";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { importExternalReviewJson, previewReviewImport } from "./reviewImport";
import type { DiagnosticRun } from "../../types/diagnostic";

function minimalCompleteRun(id: string): DiagnosticRun {
  const t = "2026-01-01T00:00:00.000Z";
  return {
    id,
    version: "1.0",
    createdAt: t,
    updatedAt: t,
    lastActiveAt: t,
    completedAt: "2026-01-01T03:00:00.000Z",
    status: "complete",
    currentModuleId: "coding",
    totalElapsedSeconds: 7200,
    completedModuleIds: ["coding"],
    answers: {},
    timings: {},
    confidence: { coding: 4 },
    hintsRevealed: [],
    moduleStartedAt: {},
  };
}

describe("review import workflow", () => {
  it("DiagnosticRun → Export → Review Import → Evidence → Weakness → ReadinessSnapshot", () => {
    const run = minimalCompleteRun("run-integration-1");
    const exp = buildDiagnosticExportV1(run);
    expect(exp.schemaVersion).toBe(1);
    expect(exp.run.id).toBe(run.id);

    let ws = emptyWorkspace();
    const review = buildReviewTemplate(run.id);
    review.reviewId = "rev-integration-1";
    review.modules.find((m) => m.moduleId === "coding")!.outcome = "validated-pass";
    review.modules.find((m) => m.moduleId === "coding")!.summary = "Clean implementation";
    review.modules.find((m) => m.moduleId === "django-sql")!.outcome = "validated-fail";
    review.modules.find((m) => m.moduleId === "django-sql")!.weaknessEntries = [
      { summary: "Missing index strategy", errorType: "sql-performance" },
    ];

    const raw = JSON.stringify(review);
    const first = importExternalReviewJson(ws, raw, {
      moduleSelfConfidence: run.confidence,
      expectedRunId: run.id,
      diagnosticSeconds: run.totalElapsedSeconds,
    });
    expect(first.applied).toBe(true);
    ws = first.workspace;

    expect(ws.evidence).toHaveLength(1);
    expect(ws.evidence[0].sourceReviewId).toBe("rev-integration-1");
    expect(ws.evidence[0].sourceRunId).toBe(run.id);
    expect(ws.weaknesses.length).toBeGreaterThanOrEqual(1);
    expect(ws.errorLog.length).toBeGreaterThanOrEqual(1);
    expect(ws.appliedReviews).toHaveLength(1);
    expect(ws.readinessSnapshots).toHaveLength(1);
    expect(ws.readinessSnapshots![0].runId).toBe(run.id);
    expect(ws.readinessSnapshots![0].diagnosticSeconds).toBe(7200);
  });

  it("skips re-import when deterministic evidence ids exist without appliedReviews record", () => {
    const runId = "run-legacy";
    const review = buildReviewTemplate(runId);
    review.reviewId = "rev-legacy";
    review.modules[0].outcome = "validated-pass";
    const reviewId = "rev-legacy";
    let ws = emptyWorkspace();
    ws = applyExternalReview(ws, review, { reviewId, runId });
    expect(ws.appliedReviews ?? []).toHaveLength(0);
    const second = importExternalReviewJson(ws, JSON.stringify(review));
    expect(second.applied).toBe(false);
    expect(second.workspace.evidence).toHaveLength(1);
    expect(second.workspace.appliedReviews).toHaveLength(1);
  });

  it("duplicate import does not duplicate evidence or weaknesses", () => {
    const runId = "run-dup";
    const review = buildReviewTemplate(runId);
    review.reviewId = "rev-dup";
    review.modules[0].outcome = "validated-pass";
    const raw = JSON.stringify(review);
    let ws = emptyWorkspace();
    ws = importExternalReviewJson(ws, raw).workspace;
    const evCount = ws.evidence.length;
    const wCount = ws.weaknesses.length;
    const snapCount = ws.readinessSnapshots!.length;

    const second = importExternalReviewJson(ws, raw);
    expect(second.applied).toBe(false);
    expect(second.workspace.evidence).toHaveLength(evCount);
    expect(second.workspace.weaknesses).toHaveLength(wCount);
    expect(second.workspace.readinessSnapshots).toHaveLength(snapCount);
    expect(second.workspace.appliedReviews).toHaveLength(1);
  });

  it("rejects invalid review with explicit errors", () => {
    const preview = previewReviewImport(emptyWorkspace(), '{"schemaVersion":2}');
    expect(preview.errors.length).toBeGreaterThan(0);
    expect(() => importExternalReviewJson(emptyWorkspace(), '{"schemaVersion":2}')).toThrow();
  });

  it("rejects runId mismatch when expectedRunId set", () => {
    const review = buildReviewTemplate("run-a");
    review.modules[0].outcome = "validated-pass";
    expect(() =>
      importExternalReviewJson(emptyWorkspace(), JSON.stringify(review), { expectedRunId: "run-b" }),
    ).toThrow(/runId mismatch/);
  });

  it("preview flags runId mismatch before apply", () => {
    const review = buildReviewTemplate("run-a");
    const preview = previewReviewImport(emptyWorkspace(), JSON.stringify(review), { expectedRunId: "run-b" });
    expect(preview.errors.some((e) => e.includes("runId mismatch"))).toBe(true);
  });

  it("preview after successful import shows alreadyApplied", () => {
    const runId = "run-preview-after";
    const review = buildReviewTemplate(runId);
    review.reviewId = "rev-preview-after";
    review.modules[0].outcome = "validated-pass";
    const raw = JSON.stringify(review);
    const first = importExternalReviewJson(emptyWorkspace(), raw);
    expect(first.applied).toBe(true);
    expect(first.preview.alreadyApplied).toBe(true);
    expect(first.preview.evidenceToAdd).toBe(0);
  });

  it("preview weakness count matches weaknessLines for validated-fail", () => {
    const review = buildReviewTemplate("run-count");
    const mod = review.modules.find((m) => m.moduleId === "django-sql")!;
    mod.outcome = "validated-fail";
    mod.weaknessEntries = [{ summary: "One gap" }];
    const preview = previewReviewImport(emptyWorkspace(), JSON.stringify(review));
    expect(preview.weaknessesToAdd).toBe(1);
  });
});
