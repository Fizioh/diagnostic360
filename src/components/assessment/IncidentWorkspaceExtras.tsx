import { INCIDENT_ACTIONS } from "../../data/incidentSim";

interface IncidentWorkspaceExtrasProps {
  actionsTaken: string[];
  onRevealAction: (actionId: string) => void;
}

export function IncidentWorkspaceExtras({ actionsTaken, onRevealAction }: IncidentWorkspaceExtrasProps) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Metrics / logs · reveal next signal</p>
      <div className="flex flex-wrap gap-2">
        {INCIDENT_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={actionsTaken.includes(action.id)}
            onClick={() => onRevealAction(action.id)}
            className="rounded border border-border px-3 py-2 font-mono text-[10px] hover:border-accent/40 disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>
      {INCIDENT_ACTIONS.filter((x) => actionsTaken.includes(x.id)).map((action) => (
        <div key={action.id} className="rounded-md border border-signal/30 bg-signal/5 p-3 text-sm text-muted">
          <p className="font-mono text-xs text-signal">{action.label}</p>
          <p className="mt-1">{action.evidence}</p>
        </div>
      ))}
    </div>
  );
}
