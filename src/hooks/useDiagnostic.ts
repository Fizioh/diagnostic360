import { useCallback, useEffect, useState } from "react";
import {
  clearRun,
  createRun,
  loadRun,
  nextModuleId,
  saveRun,
} from "../lib/storage";
import { appendAssessmentEvent } from "../domain/diagnostic/assessmentEvents";
import type {
  AssessmentEventType,
  Confidence,
  DiagnosticRun,
  ModuleAnswers,
  ModuleId,
  StoredExecutionResult,
} from "../types/diagnostic";
import { MODULE_ORDER } from "../types/diagnostic";

export function useDiagnostic() {
  const [run, setRun] = useState<DiagnosticRun | null>(() => loadRun());

  const persist = useCallback((next: DiagnosticRun) => {
    saveRun(next);
    setRun(next);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setRun((current) => {
        if (!current || current.status !== "active") return current;
        const mid = current.currentModuleId;
        const nextRun: DiagnosticRun = {
          ...current,
          totalElapsedSeconds: current.totalElapsedSeconds + 1,
          timings: {
            ...current.timings,
            [mid]: (current.timings[mid] ?? 0) + 1,
          },
          lastActiveAt: new Date().toISOString(),
        };
        saveRun(nextRun);
        return nextRun;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const startNew = useCallback(() => {
    let fresh = createRun();
    fresh = appendAssessmentEvent(fresh, fresh.currentModuleId, "assessment_started");
    fresh = appendAssessmentEvent(fresh, fresh.currentModuleId, "module_started");
    persist(fresh);
  }, [persist]);

  const pause = useCallback(() => {
    if (!run) return;
    persist({ ...run, status: "paused" });
  }, [run, persist]);

  const resume = useCallback(() => {
    if (!run) return;
    persist({
      ...run,
      status: "active",
      moduleStartedAt: {
        ...run.moduleStartedAt,
        [run.currentModuleId]: new Date().toISOString(),
      },
    });
  }, [run, persist]);

  const setModule = useCallback(
    (moduleId: ModuleId) => {
      if (!run) return;
      let next: DiagnosticRun = {
        ...run,
        currentModuleId: moduleId,
        moduleStartedAt: {
          ...run.moduleStartedAt,
          [moduleId]: run.moduleStartedAt[moduleId] ?? new Date().toISOString(),
        },
      };
      if (!run.moduleStartedAt[moduleId]) {
        next = appendAssessmentEvent(next, moduleId, "module_started");
      }
      persist(next);
    },
    [run, persist],
  );

  const updateAnswers = useCallback(
    (moduleId: ModuleId, patch: ModuleAnswers) => {
      if (!run) return;
      persist({
        ...run,
        answers: {
          ...run.answers,
          [moduleId]: { ...(run.answers[moduleId] ?? {}), ...patch },
        },
      });
    },
    [run, persist],
  );

  const revealHint = useCallback(
    (hintId: string) => {
      if (!run || run.hintsRevealed.includes(hintId)) return;
      let next: DiagnosticRun = { ...run, hintsRevealed: [...run.hintsRevealed, hintId] };
      next = appendAssessmentEvent(next, run.currentModuleId, "hint_requested", { hintId });
      persist(next);
    },
    [run, persist],
  );

  const logAssessmentEvent = useCallback(
    (moduleId: ModuleId, type: AssessmentEventType, payload?: Record<string, unknown>) => {
      if (!run) return;
      persist(appendAssessmentEvent(run, moduleId, type, payload));
    },
    [run, persist],
  );

  const storeExecutionResult = useCallback(
    (moduleId: ModuleId, result: StoredExecutionResult) => {
      if (!run) return;
      persist({
        ...run,
        lastExecutionByModule: {
          ...run.lastExecutionByModule,
          [moduleId]: result,
        },
      });
    },
    [run, persist],
  );

  const acknowledgeSave = useCallback(
    (moduleId: ModuleId) => {
      if (!run) return;
      persist(appendAssessmentEvent(run, moduleId, "save_acknowledged"));
    },
    [run, persist],
  );

  const completeModule = useCallback(
    (moduleId: ModuleId, confidence: Confidence) => {
      if (!run) return;
      const completed = run.completedModuleIds.includes(moduleId)
        ? run.completedModuleIds
        : [...run.completedModuleIds, moduleId];
      const nxt = nextModuleId(moduleId);
      const allDone = completed.length === MODULE_ORDER.length;
      let next: DiagnosticRun = {
        ...run,
        completedModuleIds: completed,
        confidence: { ...run.confidence, [moduleId]: confidence },
        currentModuleId: nxt ?? moduleId,
        status: allDone ? "complete" : run.status,
        completedAt: allDone ? new Date().toISOString() : run.completedAt,
      };
      next = appendAssessmentEvent(next, moduleId, "answer_submitted", {
        confidence,
        elapsedSeconds: run.timings[moduleId] ?? 0,
      });
      persist(next);
    },
    [run, persist],
  );

  const resetAll = useCallback(() => {
    clearRun();
    setRun(null);
  }, []);

  return {
    run,
    startNew,
    pause,
    resume,
    setModule,
    updateAnswers,
    revealHint,
    completeModule,
    resetAll,
    logAssessmentEvent,
    storeExecutionResult,
    acknowledgeSave,
  };
}
