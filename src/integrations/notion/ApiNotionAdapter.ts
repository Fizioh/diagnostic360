import { missionApiFetch } from "../auth/missionApi";
import type { NotionAdapter } from "./NotionAdapter";
import type { NotionPlanningSnapshot } from "./types";
import { loadImportedNotionSnapshot } from "./StaticSnapshotNotionAdapter";

export class ApiNotionAdapter implements NotionAdapter {
  async fetchPlanningSnapshot(): Promise<NotionPlanningSnapshot> {
    const imported = loadImportedNotionSnapshot();
    if (imported) return imported;

    const res = await missionApiFetch("/api/planning");
    if (res.status === 401) throw new Error("Planning fetch failed (401)");
    if (!res.ok) throw new Error(`Planning fetch failed (${res.status})`);
    const data = (await res.json()) as NotionPlanningSnapshot;
    return { ...data, source: "authenticated-api" };
  }
}
