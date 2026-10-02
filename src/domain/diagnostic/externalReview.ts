import type { EvidenceItem, MissionWorkspaceV1, ReadinessDomain } from "../types";
import type { Confidence, ModuleId } from "../../types/diagnostic";
import { selfConfidenceToPercent } from "../evidence/evidenceModel";
import { openWeaknessWithRetest } from "../weakness/retestLoop";

export type ReviewModuleOutcome =
  | "validated-pass"
  | "validated-partial"
  | "validated-fail"
  | "pending-human";

export interface ReviewWeaknessEntry {
  summary: string;
  errorType?: string;
  cause?: string;
  remediation?: string;
  initialScore?: number | null;
}

export interface DiagnosticExternalReviewV1 {
  schemaVersion: 1;
  reviewId?: string;
  runId: string;
  reviewedAt: string;
  reviewerLabel: string;
  modules: {
    moduleId: ModuleId;
    outcome: ReviewModuleOutcome;
    score?: number | null;
    summary?: string;
    weaknesses?: string[];
    weaknessEntries?: ReviewWeaknessEntry[];
  }[];
  overallNotes?: string;
}

const VALID_OUTCOMES: ReviewModuleOutcome[] = [
  "validated-pass",
  "validated-partial",
  "validated-fail",
  "pending-human",
];

const MODULE_DOMAINS: Partial<Record<ModuleId, ReadinessDomain>> = {
  coding: "algorithms",
  "react-ts": "react-typescript",
  "django-sql": "django",
  "code-review": "debugging",
  "system-design": "system-design",
  production: "production-devops",
  "ai-engineering": "ai-engineering",
  gis: "gis",
  communication: "senior-communication",
  english: "technical-english",
};

const KNOWN_MODULES = new Set(Object.keys(MODULE_DOMAINS));

function pushIssue(issues: string[], path: string, message: string) {
  issues.push(`${path}: ${message}`);
}

export function parseExternalReviewJson(raw: string): DiagnosticExternalReviewV1 {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Review JSON is not valid JSON");
  }
  const issues: string[] = [];
  if (!data || typeof data !== "object") {
    throw new Error("Review must be a JSON object");
  }
  const r = data as DiagnosticExternalReviewV1;
  if (r.schemaVersion !== 1) {
    pushIssue(issues, "schemaVersion", `expected 1, got ${String((r as { schemaVersion?: unknown }).schemaVersion)}`);
  }
  if (!r.runId || typeof r.runId !== "string") {
    pushIssue(issues, "runId", "required non-empty string");
  }
  if (!r.reviewedAt || typeof r.reviewedAt !== "string") {
    pushIssue(issues, "reviewedAt", "required ISO date string");
  } else if (Number.isNaN(Date.parse(r.reviewedAt))) {
    pushIssue(issues, "reviewedAt", "must be a parseable date");
  }
  if (typeof r.reviewerLabel !== "string") {
    pushIssue(issues, "reviewerLabel", "required string");
  }
  if (!Array.isArray(r.modules)) {
    pushIssue(issues, "modules", "required array");
  } else {
    r.modules.forEach((mod, i) => {
      const base = `modules[${i}]`;
      if (!mod || typeof mod !== "object") {
        pushIssue(issues, base, "must be an object");
        return;
      }
      if (!mod.moduleId || typeof mod.moduleId !== "string") {
        pushIssue(issues, `${base}.moduleId`, "required string");
      } else if (!KNOWN_MODULES.has(mod.moduleId)) {
        pushIssue(issues, `${base}.moduleId`, `unknown module "${mod.moduleId}"`);
      }
      if (!VALID_OUTCOMES.includes(mod.outcome)) {
        pushIssue(
          issues,
          `${base}.outcome`,
          `must be one of ${VALID_OUTCOMES.join(", ")}`,
        );
      }
    });
  }
  if (issues.length) {
    throw new Error(issues.join("\n"));
  }
  return r;
}

export function buildReviewTemplate(runId: string): DiagnosticExternalReviewV1 {
  const modules: ModuleId[] = [
    "coding",
    "react-ts",
    "django-sql",
    "code-review",
    "system-design",
    "production",
    "ai-engineering",
    "gis",
    "communication",
    "english",
  ];
  return {
    schemaVersion: 1,
    reviewId: crypto.randomUUID(),
    runId,
    reviewedAt: new Date().toISOString(),
    reviewerLabel: "external-reviewer",
    modules: modules.map((moduleId) => ({
      moduleId,
      outcome: "pending-human",
      score: null,
      summary: "",
      weaknesses: [],
    })),
    overallNotes: "",
  };
}

function outcomeToStrength(outcome: ReviewModuleOutcome): EvidenceItem["strength"] | null {
  if (outcome === "validated-pass") return "strong";
  if (outcome === "validated-partial") return "medium";
  return null;
}

export function weaknessLines(mod: DiagnosticExternalReviewV1["modules"][number]): ReviewWeaknessEntry[] {
  if (mod.weaknessEntries?.length) return mod.weaknessEntries;
  if (mod.weaknesses?.length) {
    return mod.weaknesses.map((summary) => ({ summary }));
  }
  if (mod.outcome === "validated-fail") {
    return [{ summary: mod.summary ?? "Gap identified in external review" }];
  }
  return [];
}

export function applyExternalReview(
  workspace: MissionWorkspaceV1,
  review: DiagnosticExternalReviewV1,
  options?: {
    moduleSelfConfidence?: Partial<Record<ModuleId, Confidence>>;
    reviewId?: string;
    runId?: string;
  },
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const traceReviewId = options?.reviewId;
  const traceRunId = options?.runId ?? review.runId;
  let next = {
    ...workspace,
    evidence: [...workspace.evidence],
    errorLog: [...(workspace.errorLog ?? [])],
  };

  for (const mod of review.modules) {
    const domain = MODULE_DOMAINS[mod.moduleId];
    if (!domain) continue;
    const strength = outcomeToStrength(mod.outcome);
    if (strength) {
      const self = options?.moduleSelfConfidence?.[mod.moduleId];
      const evidenceId = traceReviewId
        ? `ev-${traceReviewId}-${mod.moduleId}`
        : crypto.randomUUID();
      if (next.evidence.some((e) => e.id === evidenceId)) continue;
      next.evidence.push({
        id: evidenceId,
        domain,
        strength,
        title: `Diagnostic 360 · ${mod.moduleId}`,
        description: mod.summary ?? review.overallNotes ?? "",
        validatedAt: review.reviewedAt,
        sourceType: "diagnostic",
        confidence: self != null ? selfConfidenceToPercent(self) : undefined,
        sourceRunId: traceRunId,
        sourceReviewId: traceReviewId,
      });
    }
    const entries = weaknessLines(mod);
    let wi = 0;
    for (const entry of entries) {
      if (!entry.summary?.trim()) continue;
      const weaknessId = traceReviewId
        ? `wk-${traceReviewId}-${mod.moduleId}-${wi++}`
        : crypto.randomUUID();
      if (next.weaknesses.some((w) => w.id === weaknessId)) continue;
      next = openWeaknessWithRetest(next, {
        id: weaknessId,
        domain,
        summary: entry.summary.trim(),
        cause: entry.cause,
        remediation: entry.remediation ?? mod.summary,
        createdAt: at,
      });
      const errId = traceReviewId ? `err-${weaknessId}` : crypto.randomUUID();
      if (!next.errorLog.some((e) => e.id === errId)) {
        next.errorLog.push({
          id: errId,
          weaknessId,
          sourceRunId: traceRunId,
          domain,
          errorType: entry.errorType?.trim() || "diagnostic-gap",
          summary: entry.summary.trim(),
          cause: entry.cause,
          remediation: entry.remediation ?? mod.summary,
          initialScore: entry.initialScore ?? mod.score ?? null,
          createdAt: at,
          status: "open",
        });
      }
    }
  }

  return { ...next, updatedAt: at };
}
