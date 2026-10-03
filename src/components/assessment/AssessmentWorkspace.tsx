import { useEffect, useMemo, useRef, useState } from "react";
import type { ModuleExerciseDefinition } from "../../domain/diagnostic/answerModes";
import { getModuleExercise, starterForField } from "../../domain/diagnostic/moduleExercises";
import type { ModuleId, StoredExecutionResult } from "../../types/diagnostic";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { ExecutionPanel } from "./ExecutionPanel";
import { IncidentWorkspaceExtras } from "./IncidentWorkspaceExtras";
import { ProblemPanel } from "./ProblemPanel";
import { StructuredFieldsPanel } from "./StructuredFieldsPanel";
import { SystemDesignRevealExtras } from "./SystemDesignRevealExtras";
import { FieldBlock } from "../FieldBlock";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

interface AssessmentWorkspaceProps {
  moduleId: ModuleId;
  answers: Record<string, unknown>;
  executionResult: StoredExecutionResult | null;
  running: boolean;
  onPatch: (patch: Record<string, string | string[]>) => void;
  onCodeChanged: () => void;
  onResetStarter: (answerKey: string) => void;
  onRevealHint: (hintId: string) => void;
  onRevealIncidentAction: (actionId: string) => void;
  onRevealSystemDesign: (id: string) => void;
}

function SansIaBanner({ sansIa }: { sansIa: boolean }) {
  if (sansIa) {
    return (
      <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
        Sans IA · no AI autocomplete, chat, or generated solutions during this module.
      </div>
    );
  }
  return (
    <div className="rounded-md border border-signal/40 bg-signal/10 px-4 py-2 font-mono text-xs text-signal">
      AI tools allowed · assistance level recorded on export.
    </div>
  );
}

function DesktopOnlyNotice({ mode }: { mode: string }) {
  return (
    <div className="rounded-md border border-border bg-panel p-4 font-mono text-xs text-muted lg:hidden">
      {mode} exercises are best on desktop (split workspace, line numbers, run tests). You can still answer on mobile;
      use a laptop for coding ergonomics.
    </div>
  );
}

export function AssessmentWorkspace({
  moduleId,
  answers,
  executionResult,
  running,
  onPatch,
  onCodeChanged,
  onResetStarter,
  onRevealHint,
  onRevealIncidentAction,
  onRevealSystemDesign,
}: AssessmentWorkspaceProps) {
  const exercise: ModuleExerciseDefinition = useMemo(() => getModuleExercise(moduleId), [moduleId]);
  const [splitPct, setSplitPct] = useState(48);
  const draggingRef = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(62, Math.max(28, pct)));
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const primaryCodeField = exercise.codeFields?.find((f) => !f.readOnly && !f.answerKey.startsWith("_"));
  const showRunPanel =
    exercise.answerMode === "CODE" && Boolean(exercise.executionProfileId && primaryCodeField);

  const structuredValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of exercise.structuredFields ?? []) {
      out[f.answerKey] = str(answers[f.answerKey]);
    }
    return out;
  }, [answers, exercise.structuredFields]);

  const problemExtra =
    moduleId === "production" ? (
      <IncidentWorkspaceExtras
        actionsTaken={strArr(answers.actionsTaken)}
        onRevealAction={(id) => {
          onRevealHint(`incident-${id}`);
          onRevealIncidentAction(id);
        }}
      />
    ) : moduleId === "system-design" ? (
      <SystemDesignRevealExtras
        revealedIds={strArr(answers.revealedIds)}
        onReveal={(id) => {
          onRevealHint(id);
          onRevealSystemDesign(id);
        }}
      />
    ) : null;

  const answerPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
        {moduleId === "coding" && (
          <FieldBlock label="Language">
            <select
              value={str(answers.language) || "typescript"}
              onChange={(e) => onPatch({ language: e.target.value })}
              className="rounded-md border border-border bg-panel px-3 py-2 font-mono text-sm"
            >
              <option value="typescript">TypeScript / JavaScript</option>
              <option value="python">Python (save only — run Phase 2)</option>
            </select>
          </FieldBlock>
        )}
        {exercise.codeFields?.map((field) => {
          const starter = field.starterCode ?? starterForField(exercise, field.answerKey) ?? "";
          const display = str(answers[field.answerKey]) || (field.readOnly ? starter : "");
          return (
            <div key={field.answerKey} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{field.label}</p>
                {!field.readOnly && starter && (
                  <button
                    type="button"
                    onClick={() => onResetStarter(field.answerKey)}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    Reset starter
                  </button>
                )}
              </div>
              <CodeMirrorEditor
                language={field.language}
                value={display}
                readOnly={field.readOnly}
                minHeight={field.minHeight}
                onChange={(v) => onPatch({ [field.answerKey]: v })}
                onDebouncedEdit={field.readOnly ? undefined : onCodeChanged}
              />
            </div>
          );
        })}
        {exercise.structuredFields && exercise.structuredFields.length > 0 && (
          <StructuredFieldsPanel
            fields={exercise.structuredFields}
            values={structuredValues}
            showWordCount={exercise.showWordCount}
            onChange={(key, value) => onPatch({ [key]: value })}
          />
        )}
        {exercise.answerMode === "SQL" && (
          <p className="font-mono text-[10px] text-muted/80">
            SQL execution is not run server-side in Phase 1. Query is saved for reviewer evidence.
          </p>
        )}
      </div>
      {showRunPanel && (
        <div className="mt-2 shrink-0" style={{ height: "180px" }}>
          <ExecutionPanel result={executionResult} running={running} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <DesktopOnlyNotice mode={exercise.answerMode} />
      <div
        ref={gridRef}
        className="hidden min-h-[520px] lg:grid lg:overflow-hidden"
        style={{ gridTemplateColumns: `${splitPct}% 6px 1fr`, height: showRunPanel ? "min(78vh, 820px)" : "min(70vh, 720px)" }}
      >
        <div className="overflow-y-auto pr-3">
          <ProblemPanel exercise={exercise} banner={<SansIaBanner sansIa={exercise.sansIa} />} extra={problemExtra} />
        </div>
        <button
          type="button"
          aria-label="Resize panels"
          className="cursor-col-resize bg-border/40 hover:bg-accent/30"
          onMouseDown={() => {
            draggingRef.current = true;
          }}
        />
        <div className="min-h-0 overflow-hidden border-l border-border pl-3">{answerPanel}</div>
      </div>
      <div className="space-y-4 lg:hidden">
        <ProblemPanel exercise={exercise} banner={<SansIaBanner sansIa={exercise.sansIa} />} extra={problemExtra} />
        {answerPanel}
      </div>
    </div>
  );
}
