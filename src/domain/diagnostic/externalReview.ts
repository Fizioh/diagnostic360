import type { EvidenceItem, MissionWorkspaceV1, ReadinessDomain, WeaknessItem } from "../types";
import type { ModuleId } from "../../types/diagnostic";

export type ReviewModuleOutcome =
  | "validated-pass"
  | "validated-partial"
  | "validated-fail"
  | "pending-human";

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

export function applyExternalReview(
  workspace: MissionWorkspaceV1,
  review: DiagnosticExternalReviewV1,
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const evidence: EvidenceItem[] = [...workspace.evidence];
  const weaknesses: WeaknessItem[] = [...workspace.weaknesses];

  for (const mod of review.modules) {
    const domain = MODULE_DOMAINS[mod.moduleId];
    if (!domain) continue;
    const strength = outcomeToStrength(mod.outcome);
    if (strength) {
      evidence.push({
        id: crypto.randomUUID(),
        domain,
        strength,
        title: `Diagnostic 360 · ${mod.moduleId}`,
        description: mod.summary ?? review.overallNotes ?? "",
        validatedAt: review.reviewedAt,
        sourceType: "diagnostic",
      });
    }
    if (mod.outcome === "validated-fail" || (mod.weaknesses && mod.weaknesses.length > 0)) {
      const lines = mod.weaknesses?.length ? mod.weaknesses : [mod.summary ?? "Gap identified in external review"];
      for (const summary of lines) {
        if (!summary?.trim()) continue;
        weaknesses.push({
          id: crypto.randomUUID(),
          domain,
          summary: summary.trim(),
          remediation: mod.summary,
          status: "open",
          createdAt: at,
        });
      }
    }
  }

  return { ...workspace, evidence, weaknesses, updatedAt: at };
}
