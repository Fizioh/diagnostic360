import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import {
  aggregateEvidenceStrengthTotals,
  buildReadinessHistoryFromSnapshots,
  buildWeeklyEffortSeries,
} from "./missionAnalyticsData";
import type { ReadinessSnapshotV1 } from "../types";

describe("missionAnalyticsData", () => {
  it("aggregates validated evidence strength only", () => {
    const ws = emptyWorkspace();
    ws.evidence = [
      {
        id: "1",
        domain: "algorithms",
        strength: "strong",
        title: "a",
        description: "",
        validatedAt: "2026-01-01",
        sourceType: "diagnostic",
      },
      {
        id: "2",
        domain: "django",
        strength: "medium",
        title: "b",
        description: "",
        validatedAt: "2026-01-02",
        sourceType: "diagnostic",
      },
      {
        id: "3",
        domain: "django",
        strength: "weak",
        title: "c",
        description: "",
        sourceType: "document",
      },
    ];
    const t = aggregateEvidenceStrengthTotals(ws.evidence);
    expect(t).toEqual({ strong: 1, medium: 1, weak: 0, total: 2 });
  });

  it("builds readiness history from snapshots without fabrication", () => {
    const snaps: ReadinessSnapshotV1[] = [
      {
        id: "s1",
        at: "2026-01-02T12:00:00.000Z",
        sourceReviewId: "rev-1",
        runId: "run-1",
        profileScore: 55,
        domainScores: {},
        evidenceCount: 2,
        openWeaknesses: 1,
        diagnosticSeconds: 3600,
      },
    ];
    expect(buildReadinessHistoryFromSnapshots(snaps)).toHaveLength(1);
    expect(buildReadinessHistoryFromSnapshots(snaps)[0].profileScore).toBe(55);
  });

  it("weekly effort uses diagnostic seconds on import day only", () => {
    const ws = emptyWorkspace();
    ws.appliedReviews = [
      {
        reviewId: "rev-1",
        runId: "run-1",
        reviewedAt: "2026-01-05T10:00:00.000Z",
        importedAt: "2026-01-05T11:00:00.000Z",
      },
    ];
    ws.readinessSnapshots = [
      {
        id: "s1",
        at: "2026-01-05T11:00:00.000Z",
        sourceReviewId: "rev-1",
        runId: "run-1",
        profileScore: 50,
        domainScores: {},
        evidenceCount: 1,
        openWeaknesses: 0,
        diagnosticSeconds: 7200,
      },
    ];
    const series = buildWeeklyEffortSeries(ws, [], new Date("2026-01-05T23:00:00.000Z"));
    const day = series.days.find((d) => d.date === "2026-01-05");
    expect(day?.diagnosticSeconds).toBe(7200);
    expect(series.hasReliableDuration).toBe(true);
  });
});
