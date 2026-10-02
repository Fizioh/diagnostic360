import type { DiagnosticRun } from "../../types/diagnostic";

export interface DiagnosticExportV1 {
  schemaVersion: 1;
  exportKind: "diagnostic-run";
  exportedAt: string;
  run: DiagnosticRun;
}

export function buildDiagnosticExportV1(run: DiagnosticRun): DiagnosticExportV1 {
  return {
    schemaVersion: 1,
    exportKind: "diagnostic-run",
    exportedAt: new Date().toISOString(),
    run,
  };
}

export function serializeDiagnosticExport(run: DiagnosticRun): string {
  return JSON.stringify(buildDiagnosticExportV1(run), null, 2);
}

export function parseDiagnosticExportJson(raw: string): DiagnosticExportV1 {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Export JSON is not valid JSON");
  }
  if (!data || typeof data !== "object") throw new Error("Export must be a JSON object");
  const e = data as DiagnosticExportV1;
  if (e.schemaVersion !== 1) throw new Error(`Unsupported export schemaVersion: ${String((e as { schemaVersion?: unknown }).schemaVersion)}`);
  if (e.exportKind !== "diagnostic-run") throw new Error("Expected exportKind diagnostic-run");
  if (!e.run?.id) throw new Error("Export missing run.id");
  return e;
}
