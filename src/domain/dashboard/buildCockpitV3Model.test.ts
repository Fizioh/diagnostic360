import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { buildCockpitV3Model } from "./buildCockpitV3Model";

describe("buildCockpitV3Model", () => {
  it("composes dashboard and analytics without duplicating scoring logic", () => {
    const model = buildCockpitV3Model({
      workspace: emptyWorkspace(),
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(model.dashboard.overallInsufficient).toBe(true);
    expect(model.analytics.evidenceCompositionEmpty).toBe(true);
    expect(model.analytics.profileTrend).toEqual([]);
    expect(model.proofsSummary.hasData).toBe(false);
    expect(model.readinessBasis).toBe("none");
  });
});
