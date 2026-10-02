import type { LightDiagnosticQuestion } from "./types";
import { algorithmQuestions } from "./questions/algorithms";
import { aiQuestions } from "./questions/ai";
import { djangoQuestions } from "./questions/django";
import { distributedQuestions } from "./questions/distributed";
import { gisQuestions } from "./questions/gis";
import { productionQuestions } from "./questions/production";
import { reactQuestions } from "./questions/react";
import { seniorQuestions } from "./questions/senior";
import { sqlQuestions } from "./questions/sql";
import { systemDesignQuestions } from "./questions/systemDesign";

export const LIGHT_DIAGNOSTIC_QUESTIONS: LightDiagnosticQuestion[] = [
  ...reactQuestions,
  ...djangoQuestions,
  ...sqlQuestions,
  ...algorithmQuestions,
  ...systemDesignQuestions,
  ...distributedQuestions,
  ...productionQuestions,
  ...aiQuestions,
  ...gisQuestions,
  ...seniorQuestions,
];

export function getLightQuestionById(id: string): LightDiagnosticQuestion | undefined {
  return LIGHT_DIAGNOSTIC_QUESTIONS.find((q) => q.id === id);
}
