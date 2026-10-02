import type { LightDiagnosticCodeExample } from "../../domain/lightDiagnostic/types";

interface LightDiagnosticCodePanelProps {
  example: LightDiagnosticCodeExample;
}

export function LightDiagnosticCodePanel({ example }: LightDiagnosticCodePanelProps) {
  const highlights = new Set(example.highlightLines ?? []);

  return (
    <div className="overflow-hidden rounded-lg border border-neon-blue/25 bg-[#070b12] shadow-[0_0_24px_rgba(46,230,255,0.08)]">
      <div className="flex items-center gap-2 border-b border-neon-blue/15 bg-panel/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/90" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-neon-amber/90" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-signal/90" aria-hidden />
        <span className="ml-1 font-mono text-[10px] uppercase tracking-wide text-muted">{example.language}</span>
        <span className="font-mono text-[11px] text-neon-cyan/90">{example.filename}</span>
      </div>
      <div className="max-h-[min(42vh,320px)] overflow-auto p-2 font-mono text-[11px] leading-[1.45] sm:text-xs">
        {example.lines.map((line, index) => {
          const lineNo = index + 1;
          const hot = highlights.has(lineNo);
          return (
            <div
              key={lineNo}
              className={`flex gap-3 rounded-sm px-1 ${hot ? "bg-neon-amber/10 ring-1 ring-neon-amber/25" : ""}`}
            >
              <span className="w-6 shrink-0 select-none text-right text-muted/45">{lineNo}</span>
              <code className="whitespace-pre text-accent/95">{line.length ? line : " "}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}
