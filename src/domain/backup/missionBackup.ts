import type { MissionWorkspaceV1 } from "../types";
import type { NotionPlanningSnapshot } from "../../integrations/notion/types";
import type { DiagnosticRun } from "../../types/diagnostic";

export interface Mission2027BackupV1 {
  schemaVersion: 1;
  exportedAt: string;
  workspace: MissionWorkspaceV1;
  diagnosticRun: DiagnosticRun | null;
  notionSnapshot?: NotionPlanningSnapshot;
}

export function buildBackupPayload(
  workspace: MissionWorkspaceV1,
  diagnosticRun: DiagnosticRun | null,
  notionSnapshot?: NotionPlanningSnapshot | null,
): Mission2027BackupV1 {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    workspace,
    diagnosticRun,
    notionSnapshot: notionSnapshot ?? undefined,
  };
}

export function parseBackupJson(raw: string): Mission2027BackupV1 {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON");
  }
  const b = data as Mission2027BackupV1;
  if (b.schemaVersion !== 1) throw new Error("Unsupported backup schemaVersion");
  if (!b.workspace || b.workspace.schemaVersion !== 1) throw new Error("Invalid workspace in backup");
  return b;
}
