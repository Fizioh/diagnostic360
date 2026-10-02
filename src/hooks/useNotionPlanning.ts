import { useCallback, useEffect, useState } from "react";
import { ApiNotionAdapter } from "../integrations/notion/ApiNotionAdapter";
import type { NotionPlanningSnapshot } from "../integrations/notion/types";

export function useNotionPlanning() {
  const [snapshot, setSnapshot] = useState<NotionPlanningSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    const adapter = new ApiNotionAdapter();
    return adapter
      .fetchPlanningSnapshot()
      .then(setSnapshot)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Planning snapshot failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { snapshot, loading, error, reload };
}
