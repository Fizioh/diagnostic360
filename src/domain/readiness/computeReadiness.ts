import type { EvidenceItem, ReadinessDomain, ReadinessDomainView } from "../types";
import {
  computeConfidenceCalibration,
  domainEvidenceScore,
  evidenceContribution,
  insufficientEvidenceForDomain,
  READINESS_SCORE_REFERENCE,
  validatedEvidenceForDomain,
} from "../evidence/evidenceModel";

const DOMAIN_LABELS: Record<ReadinessDomain, string> = {
  algorithms: "Algorithms",
  "react-typescript": "React / TypeScript",
  python: "Python",
  django: "Django",
  "sql-postgresql": "SQL / PostgreSQL",
  "system-design": "System Design",
  "distributed-systems": "Distributed Systems",
  "production-devops": "Production / DevOps",
  debugging: "Debugging",
  "ai-engineering": "AI Engineering",
  gis: "GIS",
  "technical-english": "Technical English",
  "senior-communication": "Senior Communication",
  "behavioral-leadership": "Behavioral / Leadership",
  "public-engineering-proof": "Public Engineering Proof",
};

export const ALL_DOMAINS = Object.keys(DOMAIN_LABELS) as ReadinessDomain[];

export function computeDomainReadiness(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
  asOf: Date = new Date(),
): ReadinessDomainView {
  const items = validatedEvidenceForDomain(domain, evidence);
  if (items.length === 0) {
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      score: null,
      confidence: null,
      calibration: null,
      evidenceCount: 0,
      trend: "unknown",
      insufficientEvidence: true,
    };
  }
  const sorted = [...items].sort((a, b) => (a.validatedAt ?? "").localeCompare(b.validatedAt ?? ""));
  const score = domainEvidenceScore(domain, evidence, asOf);
  let trend: ReadinessDomainView["trend"] = "flat";
  if (sorted.length >= 2) {
    const prevItems = sorted.slice(0, -1);
    const prevWeighted = prevItems.reduce((s, e) => s + evidenceContribution(e, asOf), 0);
    const prevScore = Math.min(
      100,
      Math.round((prevWeighted / READINESS_SCORE_REFERENCE) * 100),
    );
    if ((score ?? 0) > prevScore) trend = "up";
    else if ((score ?? 0) < prevScore) trend = "down";
  }
  const confidences = items
    .filter((e) => e.sourceType === "diagnostic")
    .map((e) => e.confidence)
    .filter((c): c is number => c != null);
  const confidence =
    confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : null;
  return {
    domain,
    label: DOMAIN_LABELS[domain],
    score,
    confidence,
    calibration: computeConfidenceCalibration(domain, evidence),
    evidenceCount: items.length,
    trend,
    insufficientEvidence: insufficientEvidenceForDomain(domain, evidence),
  };
}

export function evidenceForDomain(domain: ReadinessDomain, evidence: EvidenceItem[]): EvidenceItem[] {
  return validatedEvidenceForDomain(domain, evidence);
}

export function weaknessesForDomain(
  domain: ReadinessDomain,
  weaknesses: import("../types").WeaknessItem[],
): import("../types").WeaknessItem[] {
  return weaknesses.filter((w) => w.domain === domain && w.status !== "mastered");
}

export function computeAllDomains(evidence: EvidenceItem[]): ReadinessDomainView[] {
  return ALL_DOMAINS.map((d) => computeDomainReadiness(d, evidence));
}
