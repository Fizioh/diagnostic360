import { describe, expect, it } from "vitest";
import { buildDiagnosticExportV1, parseDiagnosticExportJson, serializeDiagnosticExport } from "./diagnosticExport";
import type { DiagnosticRun } from "../../types/diagnostic";

const run: DiagnosticRun = {
  id: "run-export",
  version: "1.0",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  lastActiveAt: "2026-01-01T00:00:00.000Z",
  status: "active",
  currentModuleId: "coding",
  totalElapsedSeconds: 100,
  completedModuleIds: [],
  answers: {},
  timings: {},
  confidence: {},
  hintsRevealed: [],
  moduleStartedAt: {},
};

describe("diagnosticExport", () => {
  it("round-trips versioned export", () => {
    const json = serializeDiagnosticExport(run);
    const parsed = parseDiagnosticExportJson(json);
    expect(parsed.exportKind).toBe("diagnostic-run");
    expect(parsed.run.id).toBe("run-export");
  });

  it("buildDiagnosticExportV1 sets schemaVersion 1", () => {
    expect(buildDiagnosticExportV1(run).schemaVersion).toBe(1);
  });
});
