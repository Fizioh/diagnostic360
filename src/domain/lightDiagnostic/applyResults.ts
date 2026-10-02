import type { EvidenceStrength, MissionWorkspaceV1, ReadinessDomain } from "../types";
import { openWeaknessWithRetest } from "../weakness/retestLoop";
import type { LightDiagnosticResultsModel } from "./scoring";

function provisionalStrength(percent: number): EvidenceStrength {
  if (percent >= 75) return "medium";
  return "weak";
}

function stripAllLightDiagnosticArtifacts(workspace: MissionWorkspaceV1): MissionWorkspaceV1 {
  return {
    ...workspace,
    evidence: workspace.evidence.filter((e) => e.sourceType !== "light-diagnostic"),
    weaknesses: workspace.weaknesses.filter((w) => !w.id.startsWith("wk-light-")),
  };
}

export function applyLightDiagnosticResults(
  workspace: MissionWorkspaceV1,
  results: LightDiagnosticResultsModel,
): MissionWorkspaceV1 {
  const at = results.completedAt;
  let next = stripAllLightDiagnosticArtifacts(workspace);

  for (const domainScore of results.domainScores) {
    if (domainScore.answered === 0) continue;
    const hasPractical = next.evidence.some(
      (e) =>
        e.domain === domainScore.domain &&
        e.validatedAt &&
        e.sourceType !== "light-diagnostic",
    );
    if (hasPractical) continue;

    const strength = provisionalStrength(domainScore.percent);
    next = {
      ...next,
      evidence: [
        ...next.evidence,
        {
          id: `ev-light-${results.sessionId}-${domainScore.domain}`,
          domain: domainScore.domain,
          strength,
          title: `Light Diagnostic · ${domainScore.label}`,
          description: `Provisional baseline ${domainScore.percent}% (${domainScore.correct}/${domainScore.answered} scenario MCQ). Not equivalent to Diagnostic 360.`,
          validatedAt: at,
          sourceType: "light-diagnostic",
          provisional: true,
          sourceRunId: results.sessionId,
          confidence: domainScore.percent,
        },
      ],
    };
  }

  for (const mistake of results.highConfidenceMistakes) {
    const weaknessId = `wk-light-${results.sessionId}-${mistake.questionId}`;
    if (next.weaknesses.some((w) => w.id === weaknessId)) continue;
    next = openWeaknessWithRetest(next, {
      id: weaknessId,
      domain: mistake.domain,
      summary: `Light Diagnostic gap (confidence ${mistake.confidence}/5): ${mistake.scenario}`,
      remediation: mistake.explanation,
      createdAt: at,
    });
  }

  return { ...next, updatedAt: at };
}

export function hasValidatedPracticalForDomain(
  workspace: MissionWorkspaceV1,
  domain: ReadinessDomain,
): boolean {
  return workspace.evidence.some(
    (e) => e.domain === domain && e.validatedAt && e.sourceType !== "light-diagnostic",
  );
}
