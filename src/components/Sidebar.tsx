import { MODULES } from "../data/modulesMeta";
import type { DiagnosticRun, ModuleId } from "../types/diagnostic";
import { MODULE_ORDER } from "../types/diagnostic";

interface SidebarProps {
  run: DiagnosticRun;
  onSelect: (id: ModuleId) => void;
}

export function Sidebar({ run, onSelect }: SidebarProps) {
  const progress = Math.round((run.completedModuleIds.length / MODULE_ORDER.length) * 100);
  return (
    <aside className="flex h-full flex-col border-r border-border bg-panel/50 p-4 md:w-56 lg:w-64">
      <p className="font-mono text-[10px] tracking-widest text-muted uppercase">Diagnostic 360</p>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto" aria-label="Modules">
        {MODULES.map((m) => {
          const done = run.completedModuleIds.includes(m.id);
          const active = run.currentModuleId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors ${
                active ? "bg-accent/10 text-accent" : "text-muted hover:bg-border/30 hover:text-foreground"
              }`}
            >
              <span className="mt-0.5 font-mono text-[10px]">{done ? "●" : "○"}</span>
              <span>
                <span className="block font-medium">{m.title}</span>
                <span className="text-[10px] text-muted">{m.durationMinutes}m</span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-1 flex justify-between font-mono text-[10px] text-muted">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-signal transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </aside>
  );
}
