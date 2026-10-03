import type { AssessmentEvent, AssessmentEventType, DiagnosticRun, ModuleId } from "../../types/diagnostic";

export function createAssessmentEvent(
  moduleId: ModuleId,
  type: AssessmentEventType,
  payload?: Record<string, unknown>,
): AssessmentEvent {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    moduleId,
    type,
    payload,
  };
}

export function appendAssessmentEvent(
  run: DiagnosticRun,
  moduleId: ModuleId,
  type: AssessmentEventType,
  payload?: Record<string, unknown>,
): DiagnosticRun {
  const event = createAssessmentEvent(moduleId, type, payload);
  return {
    ...run,
    assessmentEvents: [...(run.assessmentEvents ?? []), event],
  };
}

export function normalizeRunAssessmentFields(run: DiagnosticRun): DiagnosticRun {
  return {
    ...run,
    assessmentEvents: run.assessmentEvents ?? [],
    editorAssistance: run.editorAssistance ?? {
      aiAutocomplete: false,
      aiChat: false,
      languageTooling: true,
    },
    lastExecutionByModule: run.lastExecutionByModule ?? {},
  };
}
