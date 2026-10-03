import { useCallback, useEffect, useRef, useState } from "react";
import { MODULES } from "../data/modulesMeta";
import { getModuleExercise } from "../domain/diagnostic/moduleExercises";
import { formatClock, formatDuration } from "../lib/formatTime";
import type { AssessmentEventType, DiagnosticRun, ModuleId, StoredExecutionResult } from "../types/diagnostic";
import { MODULE_ORDER } from "../types/diagnostic";
import { ConfidenceModal } from "./ConfidenceModal";
import { FinalDashboard } from "./FinalDashboard";
import { ModulePanel } from "./ModulePanel";
import { Sidebar } from "./Sidebar";

interface DiagnosticShellProps {
  run: DiagnosticRun;
  onPatch: (moduleId: ModuleId, patch: Record<string, string | string[]>) => void;
  onRevealHint: (hintId: string) => void;
  onCompleteModule: (moduleId: ModuleId, confidence: import("../types/diagnostic").Confidence) => void;
  onSelectModule: (id: ModuleId) => void;
  onPause: () => void;
  onResume: () => void;
  onLogEvent: (moduleId: ModuleId, type: AssessmentEventType, payload?: Record<string, unknown>) => void;
  onStoreExecution: (moduleId: ModuleId, result: StoredExecutionResult) => void;
  onAcknowledgeSave: (moduleId: ModuleId) => void;
}

export function DiagnosticShell({
  run,
  onPatch,
  onRevealHint,
  onCompleteModule,
  onSelectModule,
  onPause,
  onResume,
  onLogEvent,
  onStoreExecution,
  onAcknowledgeSave,
}: DiagnosticShellProps) {
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [showFinal, setShowFinal] = useState(run.status === "complete");
  const [saveFlash, setSaveFlash] = useState(false);
  const runTestsRef = useRef<(() => Promise<void>) | null>(null);
  const registerRunHandler = useCallback((handler: (() => Promise<void>) | null) => {
    runTestsRef.current = handler;
  }, []);

  useEffect(() => {
    if (run.status === "complete") setShowFinal(true);
  }, [run.status]);

  const meta = MODULES.find((m) => m.id === run.currentModuleId)!;
  const exercise = getModuleExercise(run.currentModuleId);
  const moduleIndex = MODULE_ORDER.indexOf(run.currentModuleId) + 1;
  const moduleSeconds = run.timings[run.currentModuleId] ?? 0;
  const targetSeconds = meta.durationMinutes * 60;
  const canRunTests = Boolean(exercise.executionProfileId);

  if (showFinal && run.status === "complete") {
    return <FinalDashboard run={run} onBack={() => setShowFinal(false)} />;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div>
            <p className="font-mono text-sm tracking-wide text-accent">Senior Mission 2027</p>
            <p className="font-mono text-[10px] text-muted">
              Session {run.id.slice(0, 8)} · {formatDuration(run.totalElapsedSeconds)} total
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            {run.status === "paused" ? (
              <button
                type="button"
                onClick={onResume}
                className="rounded border border-signal/40 px-3 py-1.5 text-signal"
              >
                Resume
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                className="rounded border border-border px-3 py-1.5 text-muted hover:text-accent"
              >
                Pause session
              </button>
            )}
            {run.status === "complete" && (
              <button
                type="button"
                onClick={() => setShowFinal(true)}
                className="rounded border border-accent/40 px-3 py-1.5 text-accent"
              >
                Summary
              </button>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col md:flex-row">
          <Sidebar run={run} onSelect={onSelectModule} />
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-sm">
                <div className="flex flex-wrap items-center gap-2 text-accent">
                  <span>
                    Module {moduleIndex}/{MODULE_ORDER.length}
                  </span>
                  <span className="text-muted">·</span>
                  <span>{meta.title}</span>
                  <span className="text-muted">·</span>
                  <span className={moduleSeconds > targetSeconds ? "text-amber-400" : "text-muted"}>
                    {formatClock(moduleSeconds)}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-amber-200/90">{exercise.sansIa ? "Sans IA" : "AI allowed"}</span>
                </div>
                <p className="text-[10px] text-muted">
                  Target {meta.durationMinutes}m · {meta.points} pts · {exercise.answerMode}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8">
              <ModulePanel
                moduleId={run.currentModuleId}
                run={run}
                onPatch={(patch) => onPatch(run.currentModuleId, patch)}
                onRevealHint={onRevealHint}
                onLogEvent={(type, payload) => onLogEvent(run.currentModuleId, type, payload)}
                onStoreExecution={(result) => onStoreExecution(run.currentModuleId, result)}
                registerRunHandler={registerRunHandler}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-4 md:px-8">
              {canRunTests && (
                <button
                  type="button"
                  onClick={() => void runTestsRef.current?.()}
                  className="rounded-md border border-border px-4 py-2 font-mono text-sm text-accent hover:border-accent/40"
                >
                  Run tests
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onAcknowledgeSave(run.currentModuleId);
                  setSaveFlash(true);
                  window.setTimeout(() => setSaveFlash(false), 1500);
                }}
                className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"
              >
                {saveFlash ? "Saved locally" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setPendingSubmit(true)}
                className="ml-auto rounded-md border border-accent/40 bg-accent/10 px-6 py-2.5 font-mono text-sm text-accent hover:bg-accent/15"
              >
                Submit
              </button>
            </div>
          </main>
        </div>
      </div>
      <ConfidenceModal
        open={pendingSubmit}
        onCancel={() => setPendingSubmit(false)}
        onSelect={(c) => {
          setPendingSubmit(false);
          const willComplete = !run.completedModuleIds.includes(run.currentModuleId);
          onCompleteModule(run.currentModuleId, c);
          if (willComplete && run.completedModuleIds.length + 1 >= 10) setShowFinal(true);
        }}
      />
    </>
  );
}
