import { Panel } from "../../components/ui/Panel";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";

export function SystemStatusSection() {
  const { snapshot, loading, error } = useNotionPlanning();
  const apiConfigured = Boolean(import.meta.env.VITE_MISSION_API_URL);

  return (
    <Panel title="System status" subtitle="Adapters and data sources (not shown on dashboard)">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
          <dt className="text-muted">Planning adapter</dt>
          <dd className="font-mono text-xs text-accent">{loading ? "…" : (snapshot?.source ?? "none")}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
          <dt className="text-muted">Planning fetched</dt>
          <dd className="font-mono text-xs text-accent">
            {snapshot?.fetchedAt ? new Date(snapshot.fetchedAt).toLocaleString() : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
          <dt className="text-muted">Auth API (public URL)</dt>
          <dd className="font-mono text-xs text-accent">{apiConfigured ? "configured" : "not set"}</dd>
        </div>
        {error && (
          <div>
            <dt className="text-muted">Last error</dt>
            <dd className="mt-1 text-xs text-amber-200/90">{error}</dd>
          </div>
        )}
      </dl>
    </Panel>
  );
}
