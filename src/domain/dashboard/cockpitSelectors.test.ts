import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { buildCockpitV3Model } from "./buildCockpitV3Model";
import { isProofCompleteStatus, nextEngineeringProof, selectTopDomainBars, splitEvidenceTotals } from "./cockpitSelectors";
import { buildDashboardModel } from "./buildDashboardModel";

describe("cockpitSelectors", () => {
  it("limits visible domain bars", () => {
    const dash = buildDashboardModel({
      workspace: emptyWorkspace(),
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(selectTopDomainBars(dash).length).toBeLessThanOrEqual(7);
  });

  it("splits validated vs provisional evidence totals", () => {
    const ws = emptyWorkspace();
    ws.evidence = [
      {
        id: "1",
        domain: "django",
        strength: "strong",
        title: "v",
        description: "",
        validatedAt: "2026-01-01",
        sourceType: "diagnostic",
      },
      {
        id: "2",
        domain: "algorithms",
        strength: "weak",
        title: "p",
        description: "",
        validatedAt: "2026-01-01",
        sourceType: "light-diagnostic",
        provisional: true,
      },
    ];
    const split = splitEvidenceTotals(ws.evidence);
    expect(split.validated.total).toBe(1);
    expect(split.provisional.total).toBe(1);
  });

  it("does not treat incomplete proof status as done", () => {
    expect(isProofCompleteStatus("incomplete")).toBe(false);
    expect(isProofCompleteStatus("not done")).toBe(false);
    const next = nextEngineeringProof([
      { title: "A", proofType: "oss", status: "incomplete" },
      { title: "B", proofType: "oss", status: "todo" },
    ]);
    expect(next).toBe("A");
  });

  it("buildCockpitV3Model exposes readiness basis", () => {
    const model = buildCockpitV3Model({
      workspace: emptyWorkspace(),
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(model.readinessBasis).toBe("none");
    expect(model.topDomainBars.length).toBeGreaterThan(0);
  });
});
