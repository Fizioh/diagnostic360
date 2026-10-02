import { useEffect, useState } from "react";
import { FixtureNotionAdapter } from "../integrations/notion/FixtureNotionAdapter";
import type { NotionPlanningSnapshot } from "../integrations/notion/types";

export function useNotionPlanning() {
  const [snapshot, setSnapshot] = useState<NotionPlanningSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adapter = new FixtureNotionAdapter();
    adapter
      .fetchPlanningSnapshot()
      .then(setSnapshot)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Notion fetch failed"))
      .finally(() => setLoading(false));
  }, []);

  return { snapshot, loading, error };
}
