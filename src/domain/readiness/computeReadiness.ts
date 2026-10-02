import type { EvidenceItem, ReadinessDomain, ReadinessDomainView } from "../types";

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

const WEIGHT: Record<EvidenceItem["strength"], number> = {
  strong: 3,
  medium: 1.5,
  weak: 0.25,
};

export const ALL_DOMAINS = Object.keys(DOMAIN_LABELS) as ReadinessDomain[];

export function computeDomainReadiness(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
): ReadinessDomainView {
  const items = evidence.filter((e) => e.domain === domain && e.validatedAt);
  if (items.length === 0) {
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      score: null,
      confidence: null,
      evidenceCount: 0,
      trend: "unknown",
      insufficientEvidence: true,
    };
  }
  const sorted = [...items].sort((a, b) => (a.validatedAt ?? "").localeCompare(b.validatedAt ?? ""));
  const weighted = sorted.reduce((s, e) => s + WEIGHT[e.strength], 0);
  const score = Math.min(100, Math.round((weighted / 6) * 100));
  let trend: ReadinessDomainView["trend"] = "flat";
  if (sorted.length >= 2) {
    const prevWeighted = sorted
      .slice(0, -1)
      .reduce((s, e) => s + WEIGHT[e.strength], 0);
    const prevScore = Math.min(100, Math.round((prevWeighted / 6) * 100));
    if (score > prevScore) trend = "up";
    else if (score < prevScore) trend = "down";
  }
  const confidences = items.map((e) => e.confidence).filter((c): c is number => c != null);
  const confidence =
    confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : null;
  return {
    domain,
    label: DOMAIN_LABELS[domain],
    score,
    confidence,
    evidenceCount: items.length,
    trend,
    insufficientEvidence: items.every((e) => e.strength === "weak") && items.length < 2,
  };
}

export function evidenceForDomain(domain: ReadinessDomain, evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter((e) => e.domain === domain && e.validatedAt);
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
