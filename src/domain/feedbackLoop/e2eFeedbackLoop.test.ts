import { describe, expect, it } from "vitest";
import { applyExternalReview, buildReviewTemplate } from "../diagnostic/externalReview";
import { computeDomainReadiness } from "../readiness/computeReadiness";
import { computeProfileReadiness } from "../readiness/targetProfiles";
import { passRetest } from "../weakness/retestLoop";
import { emptyWorkspace } from "../../persistence/workspaceStore";

describe("e2e feedback loop", () => {
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

    const djangoBefore = computeDomainReadiness("django", ws.evidence);
    const scoreBefore = djangoBefore.score ?? 0;

    const retestId = ws.retests[0].id;
    const result = passRetest(ws, retestId);
    ws = result.workspace;

    expect(ws.weaknesses[0].status).toBe("mastered");
    expect(ws.errorLog[0].status).toBe("mastered");
    expect(ws.evidence.filter((e) => e.sourceType === "retest")).toHaveLength(1);

    const djangoAfter = computeDomainReadiness("django", ws.evidence);
    expect((djangoAfter.score ?? 0) >= scoreBefore).toBe(true);

    const profile = computeProfileReadiness("big-tech-swe", ws.evidence);
    expect(profile.score).not.toBeNull();
  });
});
