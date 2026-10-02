import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { openWeaknessWithRetest, passRetest, startRemediation } from "./retestLoop";

describe("retestLoop", () => {
  it("passRetest strengthens evidence and masters weakness", () => {
    let ws = openWeaknessWithRetest(emptyWorkspace(), {
      id: "w1",
      domain: "algorithms",
      summary: "Binary search edge cases",
      createdAt: new Date().toISOString(),
    });
    ws = startRemediation(ws, "w1", "Practice boundary conditions");
    const retestId = ws.retests[0].id;
    const { workspace } = passRetest(ws, retestId);
    expect(workspace.weaknesses[0].status).toBe("mastered");
    expect(workspace.evidence.some((e) => e.sourceType === "retest")).toBe(true);
  });
});
