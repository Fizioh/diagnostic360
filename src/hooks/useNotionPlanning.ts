import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { ApiNotionAdapter } from "../integrations/notion/ApiNotionAdapter";
import type { NotionPlanningSnapshot } from "../integrations/notion/types";

export function useNotionPlanning() {
  const { refreshSession } = useAuth();
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
      .catch(async (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Planning snapshot failed";
        if (msg.includes("(401)")) await refreshSession();
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [refreshSession]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { snapshot, loading, error, reload };
}
