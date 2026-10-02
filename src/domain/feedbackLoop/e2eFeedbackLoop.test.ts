import { describe, expect, it } from "vitest";
import { applyExternalReview, buildReviewTemplate } from "../diagnostic/externalReview";
import { computeDomainReadiness } from "../readiness/computeReadiness";
import { explainDomainReadiness } from "../readiness/explainDomainReadiness";
import { computeProfileReadiness } from "../readiness/targetProfiles";
import { failRetest, passRetest } from "../weakness/retestLoop";
import { emptyWorkspace } from "../../persistence/workspaceStore";

function dashboardOpenWeaknesses(ws: ReturnType<typeof emptyWorkspace>) {
  return ws.weaknesses.filter((w) => w.status !== "mastered").length;
}

describe("e2e feedback loop", () => {
  const asOf = new Date("2026-10-02T12:00:00Z");

  it("review → weakness/retest → pass retest → readiness up", () => {
    const review = buildReviewTemplate("run-e2e");
    review.modules.find((m) => m.moduleId === "coding")!.outcome = "validated-pass";
    review.modules.find((m) => m.moduleId === "system-design")!.outcome = "validated-pass";
    review.modules.find((m) => m.moduleId === "django-sql")!.outcome = "validated-partial";
    review.modules.find((m) => m.moduleId === "django-sql")!.summary = "ORM ok, SQL gaps";
    review.modules.find((m) => m.moduleId === "django-sql")!.weaknesses = ["Slow query on large join"];

    let ws = applyExternalReview(emptyWorkspace(), review);
    expect(ws.evidence.some((e) => e.domain === "django")).toBe(true);
    expect(ws.weaknesses.length).toBe(1);
    expect(ws.errorLog.length).toBe(1);
    expect(ws.retests.length).toBe(1);
    expect(dashboardOpenWeaknesses(ws)).toBe(1);

    const djangoBefore = computeDomainReadiness("django", ws.evidence, asOf);
    const explainBefore = explainDomainReadiness("django", ws.evidence, ws.weaknesses, asOf);
    expect(explainBefore.score).toBe(djangoBefore.score);
    expect(explainBefore.weaknesses).toHaveLength(1);

    const scoreBefore = djangoBefore.score ?? 0;

    const retestId = ws.retests[0].id;
    const result = passRetest(ws, retestId);
    ws = result.workspace;

    expect(ws.weaknesses[0].status).toBe("mastered");
    expect(ws.errorLog[0].status).toBe("mastered");
    expect(ws.evidence.filter((e) => e.sourceType === "retest")).toHaveLength(1);
    expect(dashboardOpenWeaknesses(ws)).toBe(0);

    const djangoAfter = computeDomainReadiness("django", ws.evidence, asOf);
    const explainAfter = explainDomainReadiness("django", ws.evidence, ws.weaknesses, asOf);
    expect(explainAfter.score).toBe(djangoAfter.score);
    expect(explainAfter.scoreFromWeights).toBe(djangoAfter.score);
    expect((djangoAfter.score ?? 0) >= scoreBefore).toBe(true);
    expect(djangoAfter.trend).toBe("up");

    const profile = computeProfileReadiness("big-tech-swe", ws.evidence);
    expect(profile.score).not.toBeNull();
  });

  it("failed retest keeps weakness open and does not add retest evidence", () => {
    const review = buildReviewTemplate("run-fail");
    const mod = review.modules.find((m) => m.moduleId === "coding")!;
    mod.outcome = "validated-fail";
    mod.weaknesses = ["Missed edge case in binary search"];

    let ws = applyExternalReview(emptyWorkspace(), review);
    const retestId = ws.retests[0].id;
    ws = failRetest(ws, retestId);

    expect(ws.weaknesses[0].status).toBe("retest-due");
    expect(ws.evidence.filter((e) => e.sourceType === "retest")).toHaveLength(0);
    expect(dashboardOpenWeaknesses(ws)).toBe(1);
  });
});
