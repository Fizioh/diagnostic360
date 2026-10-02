import { Link } from "react-router-dom";
import type { EvidenceStrengthTotals } from "../../domain/analytics";
import { ChartCompactEmpty } from "./ChartCompactEmpty";
import { StrengthDonut } from "./StrengthDonut";

interface EvidenceCompositionChartProps {
  validated: EvidenceStrengthTotals;
  provisional: EvidenceStrengthTotals;
  basis: "validated" | "provisional" | "none";
}

export function EvidenceCompositionChart({ validated, provisional, basis }: EvidenceCompositionChartProps) {
  const totals = basis === "provisional" && validated.total === 0 ? provisional : validated;
  const showProvisionalNote = basis === "provisional" && provisional.total > 0;

  if (totals.total === 0 && provisional.total === 0) {
    return (
      <ChartCompactEmpty label="Baseline required" href="/diagnostic/light" linkLabel="Light Diagnostic ~15 min →" />
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <StrengthDonut totals={totals} />
      <div className="text-[10px] text-muted">
        {showProvisionalNote && <p className="text-amber-400/90">Includes provisional QCM</p>}
        <Link to="/readiness" className="mt-1 block text-accent hover:underline">
          Evidence drill-down →
        </Link>
      </div>
    </div>
  );
}
