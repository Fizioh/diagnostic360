import type { DiagnosticRun } from "../types/diagnostic";
import { serializeDiagnosticExport } from "../domain/diagnostic/diagnosticExport";

export function buildExportJson(run: DiagnosticRun): string {
  return serializeDiagnosticExport(run);
}

export function buildChatGptReviewPrompt(exportJson: string): string {
  return `${REVIEW_PROMPT}

---
DIAGNOSTIC EXPORT (DiagnosticExportV1)
---
${exportJson}

---
REVIEW OUTPUT
---
Return a single JSON object matching DiagnosticExternalReviewV1:
- schemaVersion: 1
- reviewId: keep the reviewId from the template if provided; otherwise generate a stable UUID
- runId: must match the export run.id exactly
- reviewedAt: ISO timestamp of your review
- reviewerLabel: e.g. "chatgpt-4"
- modules: one entry per module with moduleId, outcome (validated-pass | validated-partial | validated-fail | pending-human), score 0-100 optional, summary, weaknessEntries[] with summary, errorType, cause, remediation, initialScore
- overallNotes: optional string

Do not wrap in markdown fences. Outcomes drive evidence (pass/partial) and weaknesses (fail + weaknessEntries).`;
}

export const REVIEW_PROMPT = `You are reviewing a Senior Mission 2027 Diagnostic 360 session for a candidate targeting staff-level readiness in 2027.

Assess each module honestly against senior bar: depth, production mindset, communication, and calibration vs self-reported confidence in the export.

Produce structured JSON only (DiagnosticExternalReviewV1) — no prose outside JSON.`;
