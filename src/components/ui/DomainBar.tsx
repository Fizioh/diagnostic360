interface DomainBarProps {
  label: string;
  score: number | null;
  insufficient: boolean;
}

export function DomainBar({ label, score, insufficient }: DomainBarProps) {
  const width = insufficient || score == null ? 0 : Math.min(100, score);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-3 text-xs">
      <div>
        <div className="flex justify-between gap-2 text-muted">
          <span>{label}</span>
          <span className="font-mono tabular-nums text-accent/90">
            {insufficient || score == null ? "—" : score}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/80">
          <div
            className="h-full rounded-full bg-accent/80 transition-[width] duration-300"
            style={{ width: `${width}%` }}
            role="progressbar"
            aria-valuenow={insufficient ? 0 : width}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} readiness`}
          />
        </div>
      </div>
    </div>
  );
}
