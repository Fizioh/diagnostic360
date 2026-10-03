import type { StoredExecutionResult } from "../../types/diagnostic";

interface ExecutionPanelProps {
  result: StoredExecutionResult | null;
  running?: boolean;
}

export function ExecutionPanel({ result, running }: ExecutionPanelProps) {
  return (
    <div className="flex h-full min-h-[140px] flex-col border-t border-border bg-[#07080a] font-mono text-xs">
      <div className="border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted">
        Tests / Output
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-muted">
        {running && <p className="text-accent">Running…</p>}
        {!running && !result && <p className="text-muted/70">Run tests to see stdout, stderr, and results.</p>}
        {!running && result?.unsupportedReason && (
          <p className="text-amber-300/90">{result.unsupportedReason}</p>
        )}
        {!running && result && (
          <>
            {result.stdout && (
              <pre className="mb-2 whitespace-pre-wrap text-accent/90">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="mb-2 whitespace-pre-wrap text-red-300/90">{result.stderr}</pre>
            )}
            {result.tests.length > 0 && (
              <ul className="space-y-1">
                {result.tests.map((t) => (
                  <li key={t.id} className={t.passed ? "text-emerald-400/90" : "text-red-300/90"}>
                    {t.passed ? "✓" : "✗"} {t.name}
                    {t.message ? ` — ${t.message}` : ""}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[10px] text-muted/60">{result.durationMs}ms · {result.at}</p>
          </>
        )}
      </div>
    </div>
  );
}
