import type { Confidence } from "../types/diagnostic";

interface ConfidenceModalProps {
  open: boolean;
  onSelect: (c: Confidence) => void;
  onCancel: () => void;
}

const labels: Record<Confidence, string> = {
  1: "Guessing",
  2: "Uncertain",
  3: "Reasonable",
  4: "Confident",
  5: "Very confident",
};

export function ConfidenceModal({ open, onSelect, onCancel }: ConfidenceModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-panel p-6 shadow-xl">
        <h3 className="text-lg font-medium text-accent">Module complete</h3>
        <p className="mt-2 text-sm text-muted">How confident are you in this answer?</p>
        <div className="mt-4 space-y-2">
          {([1, 2, 3, 4, 5] as Confidence[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              className="flex w-full items-center gap-3 rounded-md border border-border px-4 py-2.5 text-left text-sm hover:border-accent/40 hover:bg-accent/5"
            >
              <span className="font-mono text-accent">{n}</span>
              <span className="text-muted">{labels[n]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-md py-2 text-xs text-muted hover:text-accent"
        >
          Continue editing
        </button>
      </div>
    </div>
  );
}
