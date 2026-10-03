import type { ModuleId } from "../../types/diagnostic";

export type AnswerMode = "CODE" | "SQL" | "TEXT" | "STRUCTURED" | "INCIDENT";

export type EditorLanguage = "typescript" | "javascript" | "python" | "sql" | "tsx" | "plaintext";

export type AssistanceLevel = "sans-ia" | "ai-allowed";

export interface EditorAssistanceConfig {
  aiAutocomplete: boolean;
  aiChat: boolean;
  languageTooling: boolean;
}

export function assistanceForModule(aiAllowed: boolean): EditorAssistanceConfig {
  if (aiAllowed) {
    return { aiAutocomplete: false, aiChat: false, languageTooling: true };
  }
  return { aiAutocomplete: false, aiChat: false, languageTooling: true };
}

export interface ProblemSection {
  heading?: string;
  body: string;
  monospace?: boolean;
}

export interface CodeFieldSpec {
  answerKey: string;
  label: string;
  language: EditorLanguage;
  starterCode?: string;
  readOnly?: boolean;
  minHeight?: string;
}

export interface StructuredFieldSpec {
  answerKey: string;
  label: string;
  rows?: number;
  placeholder?: string;
}

export interface ModuleExerciseDefinition {
  moduleId: ModuleId;
  answerMode: AnswerMode;
  sansIa: boolean;
  problem: ProblemSection[];
  codeFields?: CodeFieldSpec[];
  structuredFields?: StructuredFieldSpec[];
  executionProfileId?: string;
  sqlSchema?: string;
  showWordCount?: boolean;
}
