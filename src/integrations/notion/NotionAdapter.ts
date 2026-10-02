import type { NotionPlanningSnapshot } from "./types";

export interface NotionAdapter {
  fetchPlanningSnapshot(): Promise<NotionPlanningSnapshot>;
}
