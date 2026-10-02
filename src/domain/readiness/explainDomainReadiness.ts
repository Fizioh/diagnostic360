import type { EvidenceItem, ReadinessDomain, WeaknessItem } from "../types";
import {
  EVIDENCE_STRENGTH_WEIGHT,
  READINESS_SCORE_REFERENCE,
  recencyFactor,
  validatedEvidenceForDomain,
} from "../evidence/evidenceModel";
import { computeDomainReadiness, weaknessesForDomain } from "./computeReadiness";

export interface EvidenceLineExplanation {
  id: string;
  title: string;
  description: string;
  sourceType: EvidenceItem["sourceType"];
  strength: EvidenceItem["strength"];
  baseWeight: number;
  recencyFactor: number;
  effectiveWeight: number;
  validatedAt: string;
  selfConfidencePercent: number | null;
}

export interface DomainReadinessExplanation {
  domain: ReadinessDomain;
  label: string;
  score: number | null;
  insufficientEvidence: boolean;
  calibration: import("../types").ConfidenceCalibration;
  trend: import("../types").ReadinessDomainView["trend"];
  trendPreviousScore: number | null;
  avgSelfConfidencePercent: number | null;
  totalEffectiveWeight: number;
  scoreFromWeights: number | null;
  evidenceLines: EvidenceLineExplanation[];
  weaknesses: WeaknessItem[];
  lastValidatedAt: string | null;
  lastValidatedStrength: EvidenceItem["strength"] | null;
  lastValidatedSourceType: EvidenceItem["sourceType"] | null;
}

export function explainDomainReadiness(
  domain: ReadinessDomain,
  evidence: EvidenceItem[],
  weaknesses: WeaknessItem[],
  asOf: Date = new Date(),
): DomainReadinessExplanation {
  const view = computeDomainReadiness(domain, evidence, asOf);
  const items = validatedEvidenceForDomain(domain, evidence).sort((a, b) =>
    (a.validatedAt ?? "").localeCompare(b.validatedAt ?? ""),
  );

  const evidenceLines: EvidenceLineExplanation[] = items.map((e) => {
    const baseWeight = EVIDENCE_STRENGTH_WEIGHT[e.strength];
    const recency = recencyFactor(e.validatedAt!, asOf);
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      sourceType: e.sourceType,
      strength: e.strength,
      baseWeight,
      recencyFactor: recency,
      effectiveWeight: baseWeight * recency,
      validatedAt: e.validatedAt!,
      selfConfidencePercent: e.confidence ?? null,
    };
  });

  const totalEffectiveWeight = evidenceLines.reduce((s, l) => s + l.effectiveWeight, 0);
  const scoreFromWeights =
    evidenceLines.length === 0
      ? null
      : Math.min(100, Math.round((totalEffectiveWeight / READINESS_SCORE_REFERENCE) * 100));

  let trendPreviousScore: number | null = null;
  if (items.length >= 2) {
    const prevWeighted = items
      .slice(0, -1)
      .reduce((s, e) => s + EVIDENCE_STRENGTH_WEIGHT[e.strength] * recencyFactor(e.validatedAt!, asOf), 0);
    trendPreviousScore = Math.min(100, Math.round((prevWeighted / READINESS_SCORE_REFERENCE) * 100));
  }

  const byRecency = [...items].sort((a, b) => (b.validatedAt ?? "").localeCompare(a.validatedAt ?? ""));
  const latest = byRecency[0];

  return {
    domain: view.domain,
    label: view.label,
    score: view.score,
    insufficientEvidence: view.insufficientEvidence,
    calibration: view.calibration,
    trend: view.trend,
    trendPreviousScore,
    avgSelfConfidencePercent: view.confidence,
    totalEffectiveWeight,
    scoreFromWeights,
    evidenceLines,
    weaknesses: weaknessesForDomain(domain, weaknesses),
    lastValidatedAt: latest?.validatedAt ?? null,
    lastValidatedStrength: latest?.strength ?? null,
    lastValidatedSourceType: latest?.sourceType ?? null,
  };
}
