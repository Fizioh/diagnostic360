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
