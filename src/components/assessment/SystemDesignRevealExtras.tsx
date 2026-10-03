import { SD_REVEALS } from "../../data/systemDesignReveal";

interface SystemDesignRevealExtrasProps {
  revealedIds: string[];
  onReveal: (id: string) => void;
}

export function SystemDesignRevealExtras({ revealedIds, onReveal }: SystemDesignRevealExtrasProps) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Reveal constraints after clarification</p>
      <div className="flex flex-wrap gap-2">
        {SD_REVEALS.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={revealedIds.includes(r.id)}
            onClick={() => onReveal(r.id)}
            className="rounded border border-border px-3 py-1.5 font-mono text-[10px] hover:border-accent/40 disabled:opacity-40"
          >
            Reveal: {r.title}
          </button>
        ))}
      </div>
      {SD_REVEALS.filter((r) => revealedIds.includes(r.id)).map((r) => (
        <div key={r.id} className="rounded-md border border-border bg-[#0a0b0e] p-4 text-sm text-muted">
          <p className="font-mono text-xs text-accent">{r.title}</p>
          <p className="mt-2">{r.body}</p>
        </div>
      ))}
    </div>
  );
}
