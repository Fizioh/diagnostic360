import { normalizeRunAssessmentFields } from "../domain/diagnostic/assessmentEvents";
import { MODULE_ORDER, type DiagnosticRun, type ModuleId } from "../types/diagnostic";

const STORAGE_KEY = "sm2027-diagnostic-run";

export function createRun(): DiagnosticRun {
  const now = new Date().toISOString();
  return {
    version: "1.0",
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "active",
    currentModuleId: MODULE_ORDER[0],
    completedModuleIds: [],
    answers: {},
    timings: {},
    confidence: {},
    hintsRevealed: [],
    moduleStartedAt: { [MODULE_ORDER[0]]: now },
    totalElapsedSeconds: 0,
    lastActiveAt: now,
    assessmentEvents: [],
    editorAssistance: { aiAutocomplete: false, aiChat: false, languageTooling: true },
    lastExecutionByModule: {},
  };
}

export function loadRun(): DiagnosticRun | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeRunAssessmentFields(JSON.parse(raw) as DiagnosticRun);
  } catch {
    return null;
  }
}

export function saveRun(run: DiagnosticRun): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...run, updatedAt: new Date().toISOString() }));
}

export function clearRun(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function nextModuleId(current: ModuleId): ModuleId | null {
  const i = MODULE_ORDER.indexOf(current);
  if (i < 0 || i >= MODULE_ORDER.length - 1) return null;
  return MODULE_ORDER[i + 1];
}
