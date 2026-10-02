import { Link } from "react-router-dom";
import { useLocale } from "../../app/i18n/LocaleProvider";
import type { ReadinessBasis } from "../../domain/readiness/readinessBasis";
import type { FifaRadarStat } from "../../domain/dashboard/fifaCardStats";

interface EngineerReadinessFifaCardProps {
  ovr: number | null;
  insufficient: boolean;
  profileLabel: string;
  basis: ReadinessBasis;
  stats: FifaRadarStat[];
  qualitySubtitle?: string | null;
}

const AXES = 8;

function point(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = (-Math.PI / 2 + (index * 2 * Math.PI) / total);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function ringPolygon(cx: number, cy: number, radius: number, total: number) {
  return Array.from({ length: total }, (_, i) => {
    const p = point(cx, cy, radius, i, total);
    return `${p.x},${p.y}`;
  }).join(" ");
}

function valuePolygon(cx: number, cy: number, maxR: number, stats: FifaRadarStat[], total: number) {
  return stats
    .slice(0, total)
    .map((s, i) => {
      const v = s.value == null ? 0 : Math.min(100, Math.max(0, s.value));
      const r = maxR * (v / 100);
      const p = point(cx, cy, r, i, total);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

function cardTheme(basis: ReadinessBasis, insufficient: boolean) {
  if (insufficient || basis === "none") {
    return {
      frame: "from-zinc-700/80 via-zinc-800/90 to-zinc-900",
      border: "border-zinc-500/40",
      ovr: "text-zinc-300",
      shine: "opacity-20",
      fill: "rgba(120,130,150,0.22)",
      stroke: "rgba(180,190,210,0.55)",
    };
  }
  if (basis === "provisional") {
    return {
      frame: "from-cyan-900/70 via-slate-800/95 to-indigo-950",
      border: "border-neon-cyan/45",
      ovr: "text-neon-cyan",
      shine: "opacity-35",
      fill: "rgba(46,230,255,0.18)",
      stroke: "rgba(46,230,255,0.75)",
    };
  }
  return {
    frame: "from-amber-700/50 via-yellow-900/40 to-zinc-900",
    border: "border-amber-400/55",
    ovr: "text-amber-200",
    shine: "opacity-40",
    fill: "rgba(255,200,80,0.2)",
    stroke: "rgba(255,210,100,0.85)",
  };
}

export function EngineerReadinessFifaCard({
  ovr,
  insufficient,
  profileLabel,
  basis,
  stats,
  qualitySubtitle,
}: EngineerReadinessFifaCardProps) {
  const { t } = useLocale();
  const theme = cardTheme(basis, insufficient);
  const cx = 60;
  const cy = 62;
  const maxR = 38;
  const radarStats = stats.length >= AXES ? stats.slice(0, AXES) : stats;

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
      <div
        className={`relative w-[11.5rem] shrink-0 overflow-hidden rounded-xl border bg-gradient-to-br p-2 shadow-lg ${theme.border} ${theme.frame}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.12)_0%,transparent_40%,transparent_60%,rgba(255,255,255,0.06)_100%)] ${theme.shine}`}
          aria-hidden
        />
        <div className="relative flex items-start justify-between px-1 pt-0.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted/90">{t.fifaCard.ovr}</p>
            <p className={`text-4xl font-black tabular-nums leading-none ${theme.ovr}`}>
              {insufficient || ovr == null ? "—" : ovr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{t.fifaCard.role}</p>
            <p className="max-w-[4.5rem] truncate text-[11px] font-bold uppercase text-accent">SWE</p>
          </div>
        </div>

        <svg viewBox="0 0 120 120" className="relative mx-auto mt-1 h-[7.5rem] w-full" role="img" aria-label="Domain readiness radar">
          {[1, 0.66, 0.33].map((scale) => (
            <polygon
              key={scale}
              points={ringPolygon(cx, cy, maxR * scale, AXES)}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: AXES }, (_, i) => {
            const outer = point(cx, cy, maxR, i, AXES);
            return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" />;
          })}
          {radarStats.length >= 3 ? (
            <polygon
              points={valuePolygon(cx, cy, maxR, radarStats, AXES)}
              fill={theme.fill}
              stroke={theme.stroke}
              strokeWidth="2"
            />
          ) : null}
          {radarStats.map((s, i) => {
            const labelPt = point(cx, cy, maxR + 10, i, AXES);
            const val = s.value == null ? "—" : String(s.value);
            return (
              <g key={s.label}>
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[10px] font-mono font-semibold"
                  fill="rgba(200,210,230,0.85)"
                >
                  {s.label}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 9}
                  textAnchor="middle"
                  className="fill-[9px] font-mono"
                  fill="rgba(150,165,190,0.9)"
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="relative border-t border-white/10 px-1 pb-0.5 pt-1.5 text-center">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-accent">{profileLabel}</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted">
            {basis === "provisional"
              ? t.fifaCard.provisional
              : basis === "validated"
                ? t.fifaCard.validated
                : t.fifaCard.unrated}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        {insufficient || ovr == null ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t.fifaCard.baselineTitle}</p>
            <p className="mt-1 text-xs text-muted">{t.fifaCard.baselineHint}</p>
            <Link to="/diagnostic/light" className="cockpit-btn-primary mt-3 inline-flex text-[11px]">
              Light Diagnostic · ~15 min →
            </Link>
          </>
        ) : (
          <>
            {qualitySubtitle && (
              <p className="font-mono text-[10px] leading-snug text-muted">{qualitySubtitle}</p>
            )}
            <Link to="/readiness" className="cockpit-link mt-2 inline-block text-[11px]">
              Drill-down →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
