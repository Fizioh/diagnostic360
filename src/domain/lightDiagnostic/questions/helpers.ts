import type { LightDiagnosticQuestion } from "../types";
import type { ReadinessDomain } from "../../types";

export function mcq(
  id: string,
  readinessDomain: ReadinessDomain,
  domainLabel: string,
  difficulty: "medium" | "hard",
  scenario: string,
  choices: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  concepts: string[],
): LightDiagnosticQuestion {
  return {
    id,
    readinessDomain,
    domainLabel,
    difficulty,
    scenario,
    choices,
    correctIndex,
    explanation,
    concepts,
  };
}
