export type ModuleId =
  | "coding"
  | "react-ts"
  | "django-sql"
  | "code-review"
  | "system-design"
  | "production"
  | "ai-engineering"
  | "gis"
  | "communication"
  | "english";

export type Confidence = 1 | 2 | 3 | 4 | 5;

export type RunStatus = "active" | "paused" | "complete";

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  durationMinutes: number;
  points: number;
  aiAllowed: boolean;
}

export interface ModuleAnswers {
  [field: string]: string | string[] | number | boolean | Record<string, unknown>;
}

export type AssessmentEventType =
  | "assessment_started"
  | "module_started"
  | "code_changed"
  | "run_requested"
  | "test_result"
  | "hint_requested"
  | "signal_revealed"
  | "answer_submitted"
  | "starter_reset"
  | "save_acknowledged";

export interface AssessmentEvent {
  id: string;
  at: string;
  moduleId: ModuleId;
  type: AssessmentEventType;
  payload?: Record<string, unknown>;
}

export interface EditorAssistanceSnapshot {
  aiAutocomplete: boolean;
  aiChat: boolean;
  languageTooling: boolean;
}

export interface StoredExecutionResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  tests: { id: string; name: string; passed: boolean; message?: string }[];
  unsupportedReason?: string;
  durationMs: number;
  at: string;
}

export interface DiagnosticRun {
  version: "1.0";
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RunStatus;
  currentModuleId: ModuleId;
  completedModuleIds: ModuleId[];
  answers: Partial<Record<ModuleId, ModuleAnswers>>;
  timings: Partial<Record<ModuleId, number>>;
  confidence: Partial<Record<ModuleId, Confidence>>;
  hintsRevealed: string[];
  moduleStartedAt: Partial<Record<ModuleId, string>>;
  completedAt?: string;
  totalElapsedSeconds: number;
  lastActiveAt: string;
  assessmentEvents?: AssessmentEvent[];
  editorAssistance?: EditorAssistanceSnapshot;
  lastExecutionByModule?: Partial<Record<ModuleId, StoredExecutionResult>>;
}

export const MODULE_ORDER: ModuleId[] = [
  "coding",
  "react-ts",
  "django-sql",
  "code-review",
  "system-design",
  "production",
  "ai-engineering",
  "gis",
  "communication",
  "english",
];
