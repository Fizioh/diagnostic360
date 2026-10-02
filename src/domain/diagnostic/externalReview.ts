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

export function parseExternalReviewJson(raw: string): DiagnosticExternalReviewV1 {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON");
  }
  if (!data || typeof data !== "object") throw new Error("Review must be an object");
  const r = data as DiagnosticExternalReviewV1;
  if (r.schemaVersion !== 1) throw new Error("Unsupported review schemaVersion");
  if (!r.runId || typeof r.runId !== "string") throw new Error("Missing runId");
  if (!r.reviewedAt) throw new Error("Missing reviewedAt");
  if (!Array.isArray(r.modules)) throw new Error("Missing modules array");
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

function weaknessLines(mod: DiagnosticExternalReviewV1["modules"][number]): ReviewWeaknessEntry[] {
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
  options?: { moduleSelfConfidence?: Partial<Record<ModuleId, Confidence>> },
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
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
      next.evidence.push({
        id: crypto.randomUUID(),
        domain,
        strength,
        title: `Diagnostic 360 · ${mod.moduleId}`,
        description: mod.summary ?? review.overallNotes ?? "",
        validatedAt: review.reviewedAt,
        sourceType: "diagnostic",
        confidence: self != null ? selfConfidenceToPercent(self) : undefined,
      });
    }
    const entries = weaknessLines(mod);
    for (const entry of entries) {
      if (!entry.summary?.trim()) continue;
      const weaknessId = crypto.randomUUID();
      next = openWeaknessWithRetest(next, {
        id: weaknessId,
        domain,
        summary: entry.summary.trim(),
        cause: entry.cause,
        remediation: entry.remediation ?? mod.summary,
        createdAt: at,
      });
      next.errorLog.push({
        id: crypto.randomUUID(),
        weaknessId,
        sourceRunId: review.runId,
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

  return { ...next, updatedAt: at };
}
