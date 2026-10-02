import type { DomainEvent, MissionWorkspaceV1, PreparationTask, TaskStatus } from "../types";

export const TASK_COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  "this-week": "Cette semaine",
  today: "Aujourd'hui",
  "in-progress": "En cours",
  done: "Terminé",
};

export const TASK_FLOW: TaskStatus[] = ["backlog", "this-week", "today", "in-progress", "done"];

function mapNotionStatus(raw: string): TaskStatus {
  const s = raw.toLowerCase();
  if (s.includes("done") || s.includes("termin")) return "done";
  if (s.includes("progress") || s.includes("cours")) return "in-progress";
  if (s.includes("today") || s.includes("jour")) return "today";
  if (s.includes("week") || s.includes("semaine")) return "this-week";
  return "backlog";
}

export function notionRowToTask(row: { title: string; status: string }, index: number): PreparationTask {
  return {
    id: `notion-prep-${index}`,
    title: row.title,
    status: mapNotionStatus(row.status),
    source: "notion",
    domainTags: [],
  };
}

export function mergePreparationTasks(notion: PreparationTask[], local: PreparationTask[]): PreparationTask[] {
  const byId = new Map<string, PreparationTask>();
  for (const t of notion) byId.set(t.id, t);
  for (const t of local) {
    const base = byId.get(t.id);
    byId.set(t.id, base ? { ...base, ...t, title: t.title || base.title } : t);
  }
  return [...byId.values()];
}

export function tasksByStatus(tasks: PreparationTask[]): Record<TaskStatus, PreparationTask[]> {
  const buckets = Object.fromEntries(TASK_FLOW.map((s) => [s, [] as PreparationTask[]])) as Record<
    TaskStatus,
    PreparationTask[]
  >;
  for (const t of tasks) {
    const status = TASK_FLOW.includes(t.status) ? t.status : "backlog";
    buckets[status].push(t);
  }
  return buckets;
}

export function upsertTaskStatus(
  workspace: MissionWorkspaceV1,
  task: PreparationTask,
  status: TaskStatus,
): { workspace: MissionWorkspaceV1; event: DomainEvent | null } {
  const at = new Date().toISOString();
  const completedAt = status === "done" ? at : undefined;
  const nextTask: PreparationTask = { ...task, status, completedAt };
  const idx = workspace.tasks.findIndex((t) => t.id === task.id);
  const tasks =
    idx >= 0
      ? workspace.tasks.map((t, i) => (i === idx ? nextTask : t))
      : [...workspace.tasks, nextTask];
  const event: DomainEvent | null = status === "done" ? { type: "TaskCompleted", taskId: task.id, at } : null;
  return { workspace: { ...workspace, tasks, updatedAt: at }, event };
}

export function advanceTaskStatus(
  workspace: MissionWorkspaceV1,
  task: PreparationTask,
): { workspace: MissionWorkspaceV1; event: DomainEvent | null } {
  const i = TASK_FLOW.indexOf(task.status);
  const next = i < 0 || i >= TASK_FLOW.length - 1 ? task.status : TASK_FLOW[i + 1];
  return upsertTaskStatus(workspace, task, next);
}
