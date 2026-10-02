import type {
  ConfidenceCalibration,
  EvidenceItem,
  EvidenceStrength,
  ReadinessDomain,
} from "../types";

export const EVIDENCE_STRENGTH_WEIGHT: Record<EvidenceStrength, number> = {
  strong: 3,
  medium: 1.5,
  weak: 0.25,
};

export const READINESS_SCORE_REFERENCE = 6;

export const RECENCY_HALF_LIFE_DAYS = 90;

export function isValidatedEvidence(item: EvidenceItem): boolean {
  return Boolean(item.validatedAt?.trim());
}

export function recencyFactor(validatedAt: string, asOf: Date = new Date()): number {
  const at = new Date(validatedAt).getTime();
  if (Number.isNaN(at)) return 0;
  const ageDays = (asOf.getTime() - at) / (1000 * 60 * 60 * 24);
  if (ageDays <= 0) return 1;
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

export function evidenceContribution(item: EvidenceItem, asOf: Date = new Date()): number {
  if (!isValidatedEvidence(item)) return 0;
  const base = EVIDENCE_STRENGTH_WEIGHT[item.strength];
  return base * recencyFactor(item.validatedAt!, asOf);
}

export function validatedEvidenceForDomain(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
): EvidenceItem[] {
  return evidence.filter((e) => e.domain === domain && isValidatedEvidence(e));
}

export function domainEvidenceScore(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
  asOf: Date = new Date(),
): number | null {
  const items = validatedEvidenceForDomain(domain, evidence);
  if (items.length === 0) return null;
  const weighted = items.reduce((s, e) => s + evidenceContribution(e, asOf), 0);
  return Math.min(100, Math.round((weighted / READINESS_SCORE_REFERENCE) * 100));
}

const IMPLIED_VALIDATION_BY_STRENGTH: Record<EvidenceStrength, number> = {
  strong: 80,
  medium: 55,
  weak: 30,
};

export function selfConfidenceToPercent(confidence1to5: number): number {
  const c = Math.min(5, Math.max(1, Math.round(confidence1to5)));
  return c * 20;
}

export function computeConfidenceCalibration(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
): ConfidenceCalibration {
  const diagnostic = validatedEvidenceForDomain(domain, evidence).filter(
    (e) => e.sourceType === "diagnostic" && e.confidence != null,
  );
  if (diagnostic.length === 0) return null;
  let selfSum = 0;
  let impliedSum = 0;
  for (const e of diagnostic) {
    selfSum += e.confidence!;
    impliedSum += IMPLIED_VALIDATION_BY_STRENGTH[e.strength];
  }
  const gap = selfSum / diagnostic.length - impliedSum / diagnostic.length;
  if (Math.abs(gap) <= 12) return "aligned";
  return gap > 0 ? "overconfident" : "underconfident";
}

export function insufficientEvidenceForDomain(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
): boolean {
  const items = validatedEvidenceForDomain(domain, evidence);
  if (items.length === 0) return true;
  return items.every((e) => e.strength === "weak") && items.length < 2;
}
