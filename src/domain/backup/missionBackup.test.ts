import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { buildBackupPayload, parseBackupJson } from "./missionBackup";

describe("missionBackup", () => {
  it("round-trips backup JSON", () => {
    const payload = buildBackupPayload(emptyWorkspace(), null);
    const parsed = parseBackupJson(JSON.stringify(payload));
    expect(parsed.workspace.schemaVersion).toBe(1);
  });
});
