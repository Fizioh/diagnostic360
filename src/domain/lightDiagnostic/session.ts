import { LIGHT_DIAGNOSTIC_QUESTIONS } from "./questionBank";
import type { LightDiagnosticQuestion, LightDiagnosticResponse, LightDiagnosticSession } from "./types";

export function createLightDiagnosticSession(): LightDiagnosticSession {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    startedAt: now,
    updatedAt: now,
    status: "active",
    currentIndex: 0,
    responses: [],
  };
}

export function currentQuestion(session: LightDiagnosticSession): LightDiagnosticQuestion | null {
  if (session.status === "complete") return null;
  return LIGHT_DIAGNOSTIC_QUESTIONS[session.currentIndex] ?? null;
}

export function recordLightAnswer(
  session: LightDiagnosticSession,
  question: LightDiagnosticQuestion,
  choiceIndex: number,
  confidence: 1 | 2 | 3 | 4 | 5,
): LightDiagnosticSession {
  const correct = choiceIndex === question.correctIndex;
  const response: LightDiagnosticResponse = {
    questionId: question.id,
    choiceIndex,
    confidence,
    correct,
    answeredAt: new Date().toISOString(),
  };
  const responses = [...session.responses.filter((r) => r.questionId !== question.id), response];
  const nextIndex = session.currentIndex + 1;
  const complete = nextIndex >= LIGHT_DIAGNOSTIC_QUESTIONS.length;
  return {
    ...session,
    updatedAt: new Date().toISOString(),
    status: complete ? "complete" : session.status,
    currentIndex: complete ? LIGHT_DIAGNOSTIC_QUESTIONS.length : nextIndex,
    responses,
  };
}

export function pauseLightSession(session: LightDiagnosticSession): LightDiagnosticSession {
  if (session.status === "complete") return session;
  return { ...session, status: "paused", updatedAt: new Date().toISOString() };
}

export function resumeLightSession(session: LightDiagnosticSession): LightDiagnosticSession {
  if (session.status !== "paused") return session;
  return { ...session, status: "active", updatedAt: new Date().toISOString() };
}

export function resetLightSession(): LightDiagnosticSession {
  return createLightDiagnosticSession();
}
