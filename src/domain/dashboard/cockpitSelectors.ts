import { aggregateEvidenceStrengthTotals } from "../analytics/missionAnalyticsData";
import { isProvisionalEvidence, isValidatedPracticalEvidence } from "../evidence/evidenceModel";
import type { EvidenceItem, MissionWorkspaceV1 } from "../types";
import { COCKPIT_DOMAIN_ROWS } from "./cockpitDomains";
import type { DashboardModel } from "./buildDashboardModel";

export const COCKPIT_DOMAIN_VISIBLE = 7;

export function selectTopDomainBars(dashboard: DashboardModel) {
  const ranked = [...dashboard.domainBars].sort((a, b) => {
    const aScore = a.insufficient || a.score == null ? -1 : a.score;
    const bScore = b.insufficient || b.score == null ? -1 : b.score;
    if (aScore !== bScore) return bScore - aScore;
    return COCKPIT_DOMAIN_ROWS.findIndex((r) => r.domain === a.domain) -
      COCKPIT_DOMAIN_ROWS.findIndex((r) => r.domain === b.domain);
  });
  const withSignal = ranked.filter((r) => !r.insufficient && r.score != null);
  const pick = withSignal.length >= 3 ? withSignal.slice(0, COCKPIT_DOMAIN_VISIBLE) : ranked.slice(0, COCKPIT_DOMAIN_VISIBLE);
  return pick;
}

export function splitEvidenceTotals(evidence: EvidenceItem[]) {
  const validated = evidence.filter((e) => isValidatedPracticalEvidence(e));
  const provisional = evidence.filter((e) => isProvisionalEvidence(e) && e.validatedAt);
  return {
    validated: aggregateEvidenceStrengthTotals(validated),
    provisional: aggregateEvidenceStrengthTotals(provisional),
  };
}

export function readinessQualitySubtitle(workspace: MissionWorkspaceV1 | null, basis: "validated" | "provisional" | "none") {
  const evidence = workspace?.evidence ?? [];
  if (basis === "none") return null;
  if (basis === "provisional") {
    const n = evidence.filter((e) => isProvisionalEvidence(e)).length;
    return `PROVISIONAL · Light Diagnostic · ${n} domain signal${n === 1 ? "" : "s"}`;
  }
  const strong = evidence.filter((e) => isValidatedPracticalEvidence(e) && e.strength === "strong").length;
  const total = evidence.filter((e) => isValidatedPracticalEvidence(e)).length;
  return `VALIDATED · ${strong} strong · ${total} evidence item${total === 1 ? "" : "s"}`;
}

export function pipelineArrowLabel(stages: DashboardModel["pipelineStages"]): string | null {
  if (!stages.length) return null;
  return stages.map((s) => `${s.count}`).join(" → ");
}

export function pipelineStageCaptions(stages: DashboardModel["pipelineStages"]): string | null {
  if (!stages.length) return null;
  return stages.map((s) => s.status).join(" → ");
}

export function sumWeeklyDiagnosticSeconds(days: { diagnosticSeconds: number | null }[]): number {
  return days.reduce((n, d) => n + (d.diagnosticSeconds ?? 0), 0);
}

export function isProofCompleteStatus(status: string): boolean {
  const s = status.trim().toLowerCase();
  if (!s || s.includes("incomplete") || s.includes("not done") || s.startsWith("undone")) return false;
  return /^(done|complete|completed|published|shipped|live)$/.test(s);
}

export function nextEngineeringProof(snapshot: DashboardModel["engineeringProofs"]): string | null {
  const pending = snapshot.find((p) => !isProofCompleteStatus(p.status));
  return pending?.title ?? null;
}
