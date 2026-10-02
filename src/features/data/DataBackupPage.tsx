import { useState } from "react";
import { buildBackupPayload, parseBackupJson } from "../../domain/backup/missionBackup";
import {
  clearImportedNotionSnapshot,
  saveImportedNotionSnapshot,
} from "../../integrations/notion/StaticSnapshotNotionAdapter";
import type { NotionPlanningSnapshot } from "../../integrations/notion/types";
import { useNotionPlanning } from "../../hooks/useNotionPlanning";
import { useWorkspace } from "../../hooks/useWorkspace";
import { loadRun, saveRun } from "../../lib/storage";
import { saveWorkspace } from "../../persistence/workspaceStore";

export function DataBackupPage() {
  const { workspace, persist } = useWorkspace();
  const { snapshot, reload } = useNotionPlanning();
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const exportAll = () => {
    if (!workspace) return;
    const json = JSON.stringify(buildBackupPayload(workspace, loadRun(), snapshot), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mission2027-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  };

  const importAll = async () => {
    try {
      const backup = parseBackupJson(raw);
      await saveWorkspace(backup.workspace);
      await persist(backup.workspace);
      if (backup.diagnosticRun) saveRun(backup.diagnosticRun);
      if (backup.notionSnapshot) saveImportedNotionSnapshot(backup.notionSnapshot);
      await reload();
      setMessage("Backup restored. Refresh if diagnostic UI looks stale.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import failed");
    }
  };

  const importNotionOnly = async () => {
    try {
      const data = JSON.parse(raw) as NotionPlanningSnapshot;
      if (!Array.isArray(data.preparationTasks)) throw new Error("Not a Notion planning snapshot");
      saveImportedNotionSnapshot(data);
      await reload();
      setMessage("Notion snapshot imported (browser only, no API secrets).");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Notion import failed");
    }
  };

  const resetNotionImport = async () => {
    clearImportedNotionSnapshot();
    await reload();
    setMessage("Using bundled static Mission 2027 snapshot again.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium">Data & backup</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Workspace (IndexedDB), Diagnostic 360 (localStorage), and optional Notion planning snapshot.
          Nothing is sent to a server — this app is a static GitHub Pages frontend.
        </p>
      </div>
      <section className="rounded-lg border border-border bg-panel p-4">
        <h3 className="font-mono text-[10px] uppercase text-muted">Export</h3>
        <button
          type="button"
          disabled={!workspace}
          onClick={exportAll}
          className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent disabled:opacity-40"
        >
          Download full JSON backup
        </button>
      </section>
      <section className="rounded-lg border border-border bg-panel p-4">
        <h3 className="font-mono text-[10px] uppercase text-muted">Import</h3>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          className="mt-3 w-full rounded border border-border bg-bg px-3 py-2 font-mono text-xs"
          placeholder="Paste Mission2027BackupV1 or Notion planning JSON"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={importAll}
            disabled={!raw.trim()}
            className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent disabled:opacity-40"
          >
            Restore full backup
          </button>
          <button
            type="button"
            onClick={importNotionOnly}
            disabled={!raw.trim()}
            className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent disabled:opacity-40"
          >
            Import Notion snapshot only
          </button>
          <button
            type="button"
            onClick={resetNotionImport}
            className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"
          >
            Clear imported Notion snapshot
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-muted">{message}</p>}
      </section>
    </div>
  );
}
