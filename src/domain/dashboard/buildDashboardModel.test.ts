import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { applyExternalReview, buildReviewTemplate } from "../diagnostic/externalReview";
import { computeProfileReadiness } from "../readiness/targetProfiles";
import { buildDashboardModel } from "./buildDashboardModel";

describe("buildDashboardModel", () => {
  it("prioritizes diagnostic when no evidence exists", () => {
    const model = buildDashboardModel({
      workspace: emptyWorkspace(),
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(model.todayFocus.href).toBe("/diagnostic");
    expect(model.overallInsufficient).toBe(true);
    expect(model.overallReadinessScore).toBeNull();
  });

  it("overall readiness matches profile computation", () => {
    const review = buildReviewTemplate("run-1");
    review.modules[0].outcome = "validated-pass";
    review.modules[0].summary = "Ok";
    const ws = applyExternalReview(emptyWorkspace(), review);
    const profile = computeProfileReadiness("big-tech-swe", ws.evidence);
    const model = buildDashboardModel({
      workspace: ws,
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(model.overallReadinessScore).toBe(profile.score);
    expect(model.evidenceFeed.length).toBeGreaterThan(0);
  });

  it("does not invent domain scores when insufficient", () => {
    const model = buildDashboardModel({
      workspace: emptyWorkspace(),
      tasks: [],
      snapshot: null,
      diagnosticRun: null,
    });
    expect(model.domainBars.every((b) => b.insufficient || b.score != null)).toBe(true);
    expect(model.domainBars.filter((b) => !b.insufficient).every((b) => b.score != null)).toBe(true);
  });
});
