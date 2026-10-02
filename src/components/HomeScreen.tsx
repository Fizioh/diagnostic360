import { ESTIMATED_MINUTES, MODULES, TOTAL_POINTS } from "../data/modulesMeta";

interface HomeScreenProps {
  hasRun: boolean;
  onStart: () => void;
  onResume: () => void;
  onNewConfirm: () => void;
}

export function HomeScreen({ hasRun, onStart, onResume, onNewConfirm }: HomeScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">Senior Mission 2027</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight text-accent md:text-5xl">Diagnostic 360</h1>
      <p className="mt-4 text-lg text-muted">
        Measure your actual engineering readiness — not your perceived level.
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        <li className="rounded-md border border-border px-4 py-3 font-mono text-xs text-muted">
          {MODULES.length} modules
        </li>
        <li className="rounded-md border border-border px-4 py-3 font-mono text-xs text-muted">
          ~{Math.floor(ESTIMATED_MINUTES / 60)}h{ESTIMATED_MINUTES % 60} estimated
        </li>
        <li className="rounded-md border border-border px-4 py-3 font-mono text-xs text-muted">
          {TOTAL_POINTS} points framework
        </li>
        <li className="rounded-md border border-border px-4 py-3 font-mono text-xs text-muted">
          Local-only · auto-saved
        </li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        {hasRun ? (
          <>
            <button
              type="button"
              onClick={onResume}
              className="rounded-md border border-accent/40 bg-accent/10 px-6 py-3 font-mono text-sm text-accent hover:bg-accent/15"
            >
              Resume Diagnostic
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete current progress and start a new diagnostic?")) onNewConfirm();
              }}
              className="rounded-md border border-border px-6 py-3 font-mono text-sm text-muted hover:text-accent"
            >
              Start New Diagnostic
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="rounded-md border border-accent/40 bg-accent/10 px-6 py-3 font-mono text-sm text-accent hover:bg-accent/15"
          >
            Start Diagnostic
          </button>
        )}
      </div>
      <p className="mt-12 text-xs leading-relaxed text-muted/80">
        No authentication. No deployment. Answers stay in this browser (localStorage).
      </p>
    </div>
  );
}
