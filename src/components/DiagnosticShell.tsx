import { useEffect, useState } from "react";
import { MODULES } from "../data/modulesMeta";
import { formatClock, formatDuration } from "../lib/formatTime";
import type { DiagnosticRun, ModuleId } from "../types/diagnostic";
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
}

export function DiagnosticShell({
  run,
  onPatch,
  onRevealHint,
  onCompleteModule,
  onSelectModule,
  onPause,
  onResume,
}: DiagnosticShellProps) {
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [showFinal, setShowFinal] = useState(run.status === "complete");

  useEffect(() => {
    if (run.status === "complete") setShowFinal(true);
  }, [run.status]);

  const meta = MODULES.find((m) => m.id === run.currentModuleId)!;
  const moduleSeconds = run.timings[run.currentModuleId] ?? 0;
  const targetSeconds = meta.durationMinutes * 60;

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
            <div className="border-b border-border px-4 py-4 md:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Current challenge</p>
                  <h2 className="text-xl font-medium text-accent">{meta.title}</h2>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    Target {meta.durationMinutes}m · {meta.points} pts framework
                    {meta.aiAllowed && " · AI allowed"}
                  </p>
                </div>
                <div className="text-right font-mono text-sm">
                  <span className={moduleSeconds > targetSeconds ? "text-amber-400" : "text-muted"}>
                    {formatClock(moduleSeconds)}
                  </span>
                  <span className="text-muted"> / {formatClock(targetSeconds)}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
              <ModulePanel
                moduleId={run.currentModuleId}
                run={run}
                onPatch={(patch) => onPatch(run.currentModuleId, patch)}
                onRevealHint={onRevealHint}
              />
            </div>
            <div className="border-t border-border px-4 py-4 md:px-8">
              <button
                type="button"
                onClick={() => setPendingSubmit(true)}
                className="rounded-md border border-accent/40 bg-accent/10 px-6 py-2.5 font-mono text-sm text-accent hover:bg-accent/15"
              >
                Submit module →
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
