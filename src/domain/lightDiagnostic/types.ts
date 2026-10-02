import type { ReadinessDomain } from "../types";

export type LightDiagnosticDifficulty = "medium" | "hard";

export interface LightDiagnosticQuestion {
  id: string;
  readinessDomain: ReadinessDomain;
  domainLabel: string;
  difficulty: LightDiagnosticDifficulty;
  scenario: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  concepts: string[];
}

export interface LightDiagnosticResponse {
  questionId: string;
  choiceIndex: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  correct: boolean;
  answeredAt: string;
}

export type LightDiagnosticStatus = "active" | "paused" | "complete";

export interface LightDiagnosticSession {
  schemaVersion: 1;
  id: string;
  startedAt: string;
  updatedAt: string;
  status: LightDiagnosticStatus;
  currentIndex: number;
  responses: LightDiagnosticResponse[];
}
