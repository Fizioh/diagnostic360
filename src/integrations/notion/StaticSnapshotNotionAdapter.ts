import type { NotionAdapter } from "./NotionAdapter";
import type { NotionPlanningSnapshot } from "./types";

const IMPORT_KEY = "mission2027-notion-snapshot-import";

export function loadImportedNotionSnapshot(): NotionPlanningSnapshot | null {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as NotionPlanningSnapshot;
    if (!data || !Array.isArray(data.preparationTasks)) return null;
    return { ...data, source: "static-snapshot" };
  } catch {
    return null;
  }
}

export function saveImportedNotionSnapshot(snapshot: NotionPlanningSnapshot): void {
  localStorage.setItem(IMPORT_KEY, JSON.stringify({ ...snapshot, source: "static-snapshot" }));
}

export function clearImportedNotionSnapshot(): void {
  localStorage.removeItem(IMPORT_KEY);
}

export class StaticSnapshotNotionAdapter implements NotionAdapter {
  async fetchPlanningSnapshot(): Promise<NotionPlanningSnapshot> {
    const imported = loadImportedNotionSnapshot();
    if (imported) return imported;

    const url = `${import.meta.env.BASE_URL}data/mission2027-planning.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Planning snapshot unavailable (${res.status})`);
    const data = (await res.json()) as NotionPlanningSnapshot;
    return { ...data, fetchedAt: data.fetchedAt ?? new Date().toISOString(), source: "static-snapshot" };
  }
}
