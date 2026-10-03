import { useEffect, useState } from "react";
import { AssessmentWorkspace } from "./assessment/AssessmentWorkspace";
import { getModuleExercise, starterForField } from "../domain/diagnostic/moduleExercises";
import { runExecution } from "../domain/diagnostic/execution";
import type { DiagnosticRun, ModuleId, StoredExecutionResult } from "../types/diagnostic";

interface ModulePanelProps {
  moduleId: ModuleId;
  run: DiagnosticRun;
  onPatch: (patch: Record<string, string | string[]>) => void;
  onRevealHint: (hintId: string) => void;
  onLogEvent: (type: import("../types/diagnostic").AssessmentEventType, payload?: Record<string, unknown>) => void;
  onStoreExecution: (result: StoredExecutionResult) => void;
  registerRunHandler: (handler: (() => Promise<void>) | null) => void;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function ModulePanel({
  moduleId,
  run,
  onPatch,
  onRevealHint,
  onLogEvent,
  onStoreExecution,
  registerRunHandler,
}: ModulePanelProps) {
  const a = run.answers[moduleId] ?? {};
  const exercise = getModuleExercise(moduleId);
  const [running, setRunning] = useState(false);
  const executionResult = run.lastExecutionByModule?.[moduleId] ?? null;

  useEffect(() => {
    for (const field of exercise.codeFields ?? []) {
      if (field.readOnly || field.answerKey.startsWith("_")) continue;
      const starter = field.starterCode ?? starterForField(exercise, field.answerKey);
      if (starter && !str(a[field.answerKey])) {
        onPatch({ [field.answerKey]: starter });
      }
    }
  }, [moduleId]);

  useEffect(() => {
    const primary = exercise.codeFields?.find((f) => !f.readOnly && !f.answerKey.startsWith("_"));
    if (!exercise.executionProfileId || !primary) {
      registerRunHandler(null);
      return;
    }
    registerRunHandler(async () => {
      onLogEvent("run_requested", { profileId: exercise.executionProfileId });
      setRunning(true);
      try {
        const source = str(run.answers[moduleId]?.[primary.answerKey]);
        const language = str(run.answers[moduleId]?.language) || "typescript";
        const result = await runExecution({
          profileId: exercise.executionProfileId!,
          language,
          source,
        });
        const stored: StoredExecutionResult = {
          ...result,
          at: new Date().toISOString(),
        };
        onStoreExecution(stored);
        onLogEvent("test_result", {
          ok: result.ok,
          passed: result.tests.filter((t) => t.passed).length,
          total: result.tests.length,
        });
      } finally {
        setRunning(false);
      }
    });
    return () => registerRunHandler(null);
  }, [moduleId, run.answers, exercise, onLogEvent, onStoreExecution, registerRunHandler]);

  return (
    <AssessmentWorkspace
      moduleId={moduleId}
      answers={a}
      executionResult={executionResult}
      running={running}
      onPatch={onPatch}
      onCodeChanged={() =>
        onLogEvent("code_changed", {
          field: "implementation",
          length: str(a.implementation).length,
        })
      }
      onResetStarter={(answerKey) => {
        const starter = starterForField(exercise, answerKey) ?? "";
        onPatch({ [answerKey]: starter });
        onLogEvent("starter_reset", { answerKey });
      }}
      onRevealHint={onRevealHint}
      onRevealIncidentAction={(actionId) => {
        const taken = strArr(a.actionsTaken);
        if (!taken.includes(actionId)) {
          onPatch({ actionsTaken: [...taken, actionId] });
          onLogEvent("signal_revealed", { actionId });
        }
      }}
      onRevealSystemDesign={(id) => {
        const revealed = strArr(a.revealedIds);
        if (!revealed.includes(id)) {
          onPatch({ revealedIds: [...revealed, id] });
          onLogEvent("signal_revealed", { revealId: id });
        }
      }}
    />
  );
}
