import { notionRowToTask } from "../../domain/tasks/preparationTasks";
import type { NotionPlanningSnapshot } from "./types";

export function mapNotionPreparationToTasks(snapshot: NotionPlanningSnapshot) {
  return snapshot.preparationTasks.map((t, i) => notionRowToTask(t, i));
}
