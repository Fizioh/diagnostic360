import type { PreparationTask } from "../../domain/types";
import type { NotionPlanningSnapshot } from "./types";

export function mapNotionPreparationToTasks(snapshot: NotionPlanningSnapshot): PreparationTask[] {
  return snapshot.preparationTasks.map((t, i) => ({
    id: `notion-prep-${i}`,
    title: t.title,
    status:
      t.status.toLowerCase().includes("today")
        ? "today"
        : t.status.toLowerCase().includes("week")
          ? "this-week"
          : "backlog",
    source: "notion",
    domainTags: [],
  }));
}
