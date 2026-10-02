import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { applyExternalReview, buildReviewTemplate, parseExternalReviewJson } from "./externalReview";

describe("externalReview", () => {
  it("parses valid review", () => {
    const template = buildReviewTemplate("run-1");
    const parsed = parseExternalReviewJson(JSON.stringify(template));
    expect(parsed.runId).toBe("run-1");
  });

  it("creates evidence only for validated outcomes", () => {
    const review = buildReviewTemplate("run-1");
    review.modules[0].outcome = "validated-pass";
    review.modules[0].summary = "Solid";
    review.modules[1].outcome = "pending-human";
    const next = applyExternalReview(emptyWorkspace(), review);
    expect(next.evidence).toHaveLength(1);
    expect(next.evidence[0].strength).toBe("strong");
  });

  it("creates structured error log entries from weaknessEntries", () => {
    const review = buildReviewTemplate("run-1");
    const mod = review.modules.find((m) => m.moduleId === "django-sql")!;
    mod.outcome = "validated-partial";
    mod.weaknessEntries = [
      {
        summary: "Slow query on large join",
        errorType: "sql-performance",
        cause: "Missing index on foreign key",
        remediation: "Add composite index and explain analyze",
        initialScore: 42,
      },
    ];
    const next = applyExternalReview(emptyWorkspace(), review);
    expect(next.errorLog).toHaveLength(1);
    expect(next.errorLog[0].errorType).toBe("sql-performance");
    expect(next.errorLog[0].initialScore).toBe(42);
    expect(next.weaknesses).toHaveLength(1);
    expect(next.errorLog[0].weaknessId).toBe(next.weaknesses[0].id);
  });
});
