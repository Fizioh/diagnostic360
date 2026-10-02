import {
  advanceTaskStatus,
  mergePreparationTasks,
  TASK_COLUMN_LABELS,
  TASK_FLOW,
  tasksByStatus,
  upsertTaskStatus,
} from "../../domain/tasks/preparationTasks";
import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { PreparationTask, TaskStatus } from "../../domain/types";

export function TodayPage() {
  const { snapshot, loading } = useNotionPlanning();
  const { workspace, persist } = useWorkspace();
  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const merged = mergePreparationTasks(notionTasks, workspace?.tasks ?? []);
  const buckets = tasksByStatus(merged);

  const applyStatus = async (task: PreparationTask, status: TaskStatus) => {
    if (!workspace) return;
    const { workspace: next } = upsertTaskStatus(workspace, task, status);
    await persist(next);
  };

  const applyAdvance = async (task: PreparationTask) => {
    if (!workspace) return;
    const { workspace: next } = advanceTaskStatus(workspace, task);
    await persist(next);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium">Today</h2>
      <p className="text-sm text-muted">
        Task completion alone is weak evidence. Link work to diagnostics, proofs and retests.
      </p>
      {loading || !workspace ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {TASK_FLOW.map((status) => (
            <section key={status} className="rounded-lg border border-border bg-panel p-3">
              <h3 className="font-mono text-[10px] uppercase tracking-wide text-muted">
                {TASK_COLUMN_LABELS[status]}
              </h3>
              <ul className="mt-3 space-y-2">
                {buckets[status].length === 0 ? (
                  <li className="text-xs text-muted">—</li>
                ) : (
                  buckets[status].map((t) => (
                    <li key={t.id} className="rounded border border-border/80 px-2 py-2 text-xs">
                      <p className="font-mono text-accent">{t.title}</p>
                      <p className="mt-1 text-[10px] text-muted">{t.source}</p>
                      {status !== "done" && (
                        <button
                          type="button"
                          onClick={() => applyAdvance(t)}
                          className="mt-2 font-mono text-[10px] text-accent hover:underline"
                        >
                          Advance →
                        </button>
                      )}
                      {status === "today" && (
                        <button
                          type="button"
                          onClick={() => applyStatus(t, "in-progress")}
                          className="ml-2 mt-2 font-mono text-[10px] text-muted hover:underline"
                        >
                          Start
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
