import type { EvidenceItem, ReadinessDomain } from "../types";
import { ALL_DOMAINS, computeDomainReadiness } from "./computeReadiness";

export type TargetProfileId = "senior-international" | "big-tech-swe" | "ai-systems-engineer";

export const DEFAULT_TARGET_PROFILE_ID: TargetProfileId = "big-tech-swe";

export interface TargetProfileMeta {
  id: TargetProfileId;
  label: string;
  description: string;
}

export const TARGET_PROFILES: TargetProfileMeta[] = [
  {
    id: "senior-international",
    label: "Senior International Engineer",
    description: "Breadth across product engineering, communication and system design.",
  },
  {
    id: "big-tech-swe",
    label: "Big Tech SWE",
    description: "Algorithms, system design, production and scale.",
  },
  {
    id: "ai-systems-engineer",
    label: "AI Systems Engineer",
    description: "AI engineering, Python, distributed systems and production.",
  },
];

const WEIGHTS: Record<TargetProfileId, Partial<Record<ReadinessDomain, number>>> = {
  "senior-international": {
    algorithms: 1,
    "react-typescript": 1,
    django: 1,
    "system-design": 1.5,
    "production-devops": 1,
    "technical-english": 1.5,
    "senior-communication": 1.5,
    gis: 0.5,
    "public-engineering-proof": 1,
  },
  "big-tech-swe": {
    algorithms: 2,
    "react-typescript": 1,
    "system-design": 2,
    "distributed-systems": 1.5,
    "production-devops": 1.5,
    debugging: 1,
    "sql-postgresql": 1,
  },
  "ai-systems-engineer": {
    "ai-engineering": 2,
    python: 1.5,
    "system-design": 1.5,
    "distributed-systems": 1.5,
    "production-devops": 1,
    debugging: 1,
  },
};

export interface ProfileReadinessView {
  profileId: TargetProfileId;
  label: string;
  score: number | null;
  insufficientEvidence: boolean;
  coveredWeight: number;
  totalWeight: number;
}

export function computeProfileReadiness(
  profileId: TargetProfileId,
  evidence: EvidenceItem[],
): ProfileReadinessView {
  const meta = TARGET_PROFILES.find((p) => p.id === profileId)!;
  const weights = WEIGHTS[profileId];
  let weightedSum = 0;
  let weightTotal = 0;
  let covered = 0;

  for (const domain of ALL_DOMAINS) {
    const w = weights[domain];
    if (!w) continue;
    weightTotal += w;
    const view = computeDomainReadiness(domain, evidence);
    if (!view.insufficientEvidence && view.score != null) {
      weightedSum += view.score * w;
      covered += w;
    }
  }

  if (weightTotal === 0 || covered === 0) {
    return {
      profileId,
      label: meta.label,
      score: null,
      insufficientEvidence: true,
      coveredWeight: covered,
      totalWeight: weightTotal,
    };
  }

  const coverageRatio = covered / weightTotal;
  if (coverageRatio < 0.35) {
    return {
      profileId,
      label: meta.label,
      score: null,
      insufficientEvidence: true,
      coveredWeight: covered,
      totalWeight: weightTotal,
    };
  }

  return {
    profileId,
    label: meta.label,
    score: Math.round(weightedSum / covered),
    insufficientEvidence: false,
    coveredWeight: covered,
    totalWeight: weightTotal,
  };
}

export function computeAllProfiles(evidence: EvidenceItem[]): ProfileReadinessView[] {
  return TARGET_PROFILES.map((p) => computeProfileReadiness(p.id, evidence));
}
