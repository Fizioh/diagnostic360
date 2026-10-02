export type LightLocale = "fr" | "en";
import { LIGHT_DIAGNOSTIC_FR } from "./i18n/frQuestions";
import type { LightDiagnosticQuestion } from "./types";
import { LIGHT_DIAGNOSTIC_QUESTIONS, getLightQuestionById } from "./questionBank";

export function localizeLightQuestion(question: LightDiagnosticQuestion, locale: LightLocale): LightDiagnosticQuestion {
  if (locale === "en") return question;
  const fr = LIGHT_DIAGNOSTIC_FR[question.id];
  if (!fr) return question;
  return {
    ...question,
    ...fr,
    codeExample: fr.codeExample ?? question.codeExample,
  };
}

export function getLocalizedLightQuestions(locale: LightLocale): LightDiagnosticQuestion[] {
  return LIGHT_DIAGNOSTIC_QUESTIONS.map((q) => localizeLightQuestion(q, locale));
}

export function getLocalizedLightQuestionById(id: string, locale: LightLocale): LightDiagnosticQuestion | undefined {
  const q = getLightQuestionById(id);
  return q ? localizeLightQuestion(q, locale) : undefined;
}
