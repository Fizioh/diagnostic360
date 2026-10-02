import { mapNotionPreparationToTasks } from "../../integrations/notion/mapNotionToTasks";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";

export function TodayPage() {
  const { snapshot, loading } = useNotionPlanning();
  const { workspace } = useWorkspace();
  const notionTasks = snapshot ? mapNotionPreparationToTasks(snapshot) : [];
  const localToday = workspace?.tasks.filter((t) => t.status === "today") ?? [];
  const today = [...notionTasks.filter((t) => t.status === "today"), ...localToday];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium">Today</h2>
      <p className="text-sm text-muted">
        Task completion alone is weak evidence. Link work to diagnostics, proofs and retests.
      </p>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : today.length === 0 ? (
        <p className="rounded-md border border-border p-4 text-muted">No tasks scheduled for today.</p>
      ) : (
        <ul className="space-y-2">
          {today.map((t) => (
            <li key={t.id} className="rounded-md border border-border bg-panel px-4 py-3 font-mono text-sm">
              <span className="text-accent">{t.title}</span>
              <span className="ml-2 text-[10px] text-muted">{t.source}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
