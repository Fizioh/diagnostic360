import { ChartCompactEmpty } from "./ChartCompactEmpty";

interface Point {
  at: string;
  score: number | null;
}

interface ReadinessTrendChartProps {
  points: Point[];
  hasTrend: boolean;
}

export function ReadinessTrendChart({ points, hasTrend }: ReadinessTrendChartProps) {
  const valid = points.filter((p) => p.score != null) as { at: string; score: number }[];
  if (!hasTrend || valid.length < 2) {
    return (
      <ChartCompactEmpty
        label={points.length === 0 ? "No snapshots yet" : "Need 2+ review imports"}
        href="/diagnostic"
        linkLabel="Run Diagnostic 360 →"
      />
    );
  }

  const w = 280;
  const h = 72;
  const pad = 8;
  const minY = Math.min(...valid.map((p) => p.score));
  const maxY = Math.max(...valid.map((p) => p.score));
  const span = maxY - minY || 1;

  const coords = valid.map((p, i) => {
    const x = pad + (i / (valid.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.score - minY) / span) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Readiness trend"
      className="rounded-lg border border-neon-blue/10 bg-neon-blue/5"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        className="text-neon-cyan drop-shadow-[0_0_6px_rgba(46,230,255,0.6)]"
        strokeWidth="2"
        points={coords.join(" ")}
      />
      {valid.map((p, i) => {
        const x = pad + (i / (valid.length - 1)) * (w - pad * 2);
        const y = h - pad - ((p.score - minY) / span) * (h - pad * 2);
        return <circle key={p.at} cx={x} cy={y} r="3" className="fill-neon-cyan" />;
      })}
    </svg>
  );
}
