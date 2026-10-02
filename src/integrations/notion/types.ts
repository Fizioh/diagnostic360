export interface NotionPlanningSnapshot {
  fetchedAt: string;
  source: "notion-api" | "fixture" | "static-snapshot";
  roadmap: { title: string; phase: string; status: string }[];
  preparationTasks: { title: string; status: string; week?: string }[];
  pipeline: { company: string; role: string; status: string }[];
  errorLog: { title: string; domain: string; status: string }[];
  learning: { title: string; type: string; status: string }[];
  engineeringProofs: { title: string; proofType: string; status: string }[];
}
