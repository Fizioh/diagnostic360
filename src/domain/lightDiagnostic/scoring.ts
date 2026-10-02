import type { ModuleId } from "../../types/diagnostic";
import { recommendDiagnostic360Modules } from "./recommendModules";
import type { LightDiagnosticQuestion, LightDiagnosticResponse } from "./types";
import type { ReadinessDomain } from "../types";

export interface DomainLightScore {
  domain: ReadinessDomain;
  label: string;
  answered: number;
  correct: number;
  percent: number;
}

export interface LightCalibrationBucket {
  bucket: "correct-high" | "correct-low" | "incorrect-high" | "incorrect-low";
  count: number;
}

export interface LightDiagnosticResultsModel {
  sessionId: string;
  completedAt: string;
  overallPercent: number;
  domainScores: DomainLightScore[];
  strongest: DomainLightScore[];
  weakest: DomainLightScore[];
  calibration: LightCalibrationBucket[];
  highConfidenceMistakes: {
    questionId: string;
    domain: ReadinessDomain;
    scenario: string;
    explanation: string;
    confidence: number;
  }[];
  recommendedDeepDomains: ReadinessDomain[];
  recommendedDiagnostic360Modules: ModuleId[];
  conceptsNeedingValidation: string[];
}

function domainLabel(questions: LightDiagnosticQuestion[], domain: ReadinessDomain): string {
  return questions.find((q) => q.readinessDomain === domain)?.domainLabel ?? domain;
}

export function buildLightDiagnosticResults(
  sessionId: string,
  questions: LightDiagnosticQuestion[],
  responses: LightDiagnosticResponse[],
  completedAt: string,
): LightDiagnosticResultsModel {
  const byDomain = new Map<ReadinessDomain, { answered: number; correct: number }>();
  for (const q of questions) {
    if (!byDomain.has(q.readinessDomain)) {
      byDomain.set(q.readinessDomain, { answered: 0, correct: 0 });
    }
  }
  for (const r of responses) {
    const q = questions.find((x) => x.id === r.questionId);
    if (!q) continue;
    const row = byDomain.get(q.readinessDomain)!;
    row.answered += 1;
    if (r.correct) row.correct += 1;
  }

  const domainScores: DomainLightScore[] = [...byDomain.entries()].map(([domain, stats]) => ({
    domain,
    label: domainLabel(questions, domain),
    answered: stats.answered,
    correct: stats.correct,
    percent: stats.answered === 0 ? 0 : Math.round((stats.correct / stats.answered) * 100),
  }));

  const answeredTotal = responses.length;
  const correctTotal = responses.filter((r) => r.correct).length;
  const overallPercent = answeredTotal === 0 ? 0 : Math.round((correctTotal / answeredTotal) * 100);

  const ranked = [...domainScores].filter((d) => d.answered > 0).sort((a, b) => b.percent - a.percent);
  const strongest = ranked.slice(0, 3);
  const weakest = [...ranked].reverse().slice(0, 3);

  const calibration: LightCalibrationBucket[] = [
    { bucket: "correct-high", count: 0 },
    { bucket: "correct-low", count: 0 },
    { bucket: "incorrect-high", count: 0 },
    { bucket: "incorrect-low", count: 0 },
  ];
  for (const r of responses) {
    const high = r.confidence >= 4;
    const low = r.confidence <= 2;
    if (r.correct && high) calibration[0].count += 1;
    else if (r.correct && low) calibration[1].count += 1;
    else if (!r.correct && high) calibration[2].count += 1;
    else if (!r.correct && low) calibration[3].count += 1;
  }

  const highConfidenceMistakes = responses
    .filter((r) => !r.correct && r.confidence >= 4)
    .map((r) => {
      const q = questions.find((x) => x.id === r.questionId)!;
      return {
        questionId: r.questionId,
        domain: q.readinessDomain,
        scenario: q.scenario.slice(0, 120),
        explanation: q.explanation,
        confidence: r.confidence,
      };
    });

  const recommendedDeepDomains = weakest.map((w) => w.domain);
  const conceptsNeedingValidation = [
    ...new Set(
      highConfidenceMistakes.flatMap((m) => {
        const q = questions.find((x) => x.id === m.questionId);
        return q?.concepts ?? [];
      }),
    ),
  ];

  return {
    sessionId,
    completedAt,
    overallPercent,
    domainScores,
    strongest,
    weakest,
    calibration,
    highConfidenceMistakes,
    recommendedDeepDomains,
    recommendedDiagnostic360Modules: recommendDiagnostic360Modules(recommendedDeepDomains),
    conceptsNeedingValidation,
  };
}
