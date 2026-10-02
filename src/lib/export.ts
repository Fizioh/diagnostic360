import type { DiagnosticRun } from "../types/diagnostic";

export function buildExportJson(run: DiagnosticRun): string {
  const payload = {
    version: run.version,
    reviewTemplateHint: "Import structured review as DiagnosticExternalReviewV1 JSON after external assessment",
    run: {
      id: run.id,
      createdAt: run.createdAt,
      completedAt: run.completedAt,
      status: run.status,
      totalElapsedSeconds: run.totalElapsedSeconds,
    },
    modules: run.answers,
    timings: run.timings,
    confidence: run.confidence,
    hintsRevealed: run.hintsRevealed,
    completedAt: run.completedAt ?? null,
  };
  return JSON.stringify(payload, null, 2);
}

export const REVIEW_PROMPT = `Review this Senior Mission 2027 diagnostic. Score the candidate /100 across the defined modules. Identify strengths, weaknesses, senior-readiness gaps, confidence calibration and create a prioritized 30-day remediation plan.`;
