import { useCallback, useEffect, useState } from "react";
import type { MissionWorkspaceV1 } from "../domain/types";
import { emptyWorkspace, loadWorkspace, saveWorkspace } from "../persistence/workspaceStore";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<MissionWorkspaceV1 | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspace().then((w) => {
      setWorkspace(w);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: MissionWorkspaceV1) => {
    setWorkspace(next);
    await saveWorkspace(next);
  }, []);

  const reset = useCallback(async () => {
    const fresh = emptyWorkspace();
    await persist(fresh);
  }, [persist]);

  return { workspace, loading, persist, reset };
}
