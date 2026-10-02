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
