import type { ModuleExerciseDefinition } from "../../domain/diagnostic/answerModes";

interface ProblemPanelProps {
  exercise: ModuleExerciseDefinition;
  banner?: React.ReactNode;
  extra?: React.ReactNode;
}

export function ProblemPanel({ exercise, banner, extra }: ProblemPanelProps) {
  return (
    <div className="space-y-4 pr-2">
      {banner}
      {exercise.problem.map((section, i) => (
        <div key={i}>
          {section.heading && <p className="font-mono text-xs uppercase tracking-wide text-accent">{section.heading}</p>}
          {section.monospace ? (
            <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-[#0a0b0e] p-4 font-mono text-xs text-accent/90 whitespace-pre-wrap">
              {section.body}
            </pre>
          ) : (
            <p className="mt-1 text-sm text-muted">{section.body}</p>
          )}
        </div>
      ))}
      {exercise.sqlSchema && (
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-accent">Schema</p>
          <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-panel p-3 font-mono text-[11px] text-muted whitespace-pre-wrap">
            {exercise.sqlSchema}
          </pre>
        </div>
      )}
      {extra}
    </div>
  );
}
