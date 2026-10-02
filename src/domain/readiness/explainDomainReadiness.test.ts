import { describe, expect, it } from "vitest";
import type { EvidenceItem } from "../types";
import { computeDomainReadiness } from "./computeReadiness";
import { explainDomainReadiness } from "./explainDomainReadiness";

const sample: EvidenceItem[] = [
  {
    id: "a",
    domain: "django",
    strength: "strong",
    title: "Diagnostic 360 · django-sql",
    description: "Solid ORM usage",
    validatedAt: "2026-09-01T00:00:00Z",
    sourceType: "diagnostic",
    confidence: 80,
  },
  {
    id: "b",
    domain: "django",
    strength: "medium",
    title: "Retest passed",
    description: "Query plan fixed",
    validatedAt: "2026-10-01T00:00:00Z",
    sourceType: "retest",
  },
];

describe("explainDomainReadiness", () => {
  const asOf = new Date("2026-10-02T12:00:00Z");

  it("matches computeDomainReadiness score and flags", () => {
    const view = computeDomainReadiness("django", sample, asOf);
    const explanation = explainDomainReadiness("django", sample, [], asOf);
    expect(explanation.score).toBe(view.score);
    expect(explanation.insufficientEvidence).toBe(view.insufficientEvidence);
    expect(explanation.calibration).toBe(view.calibration);
    expect(explanation.trend).toBe(view.trend);
  });

  it("recomputes score from effective weights shown in lines", () => {
    const explanation = explainDomainReadiness("django", sample, [], asOf);
    const sumLines = explanation.evidenceLines.reduce((s, l) => s + l.effectiveWeight, 0);
    expect(explanation.totalEffectiveWeight).toBeCloseTo(sumLines, 5);
    expect(explanation.scoreFromWeights).toBe(explanation.score);
    for (const line of explanation.evidenceLines) {
      expect(line.effectiveWeight).toBeCloseTo(line.baseWeight * line.recencyFactor, 8);
    }
  });

  it("reports last validated performance from most recent evidence", () => {
    const explanation = explainDomainReadiness("django", sample, [], asOf);
    expect(explanation.lastValidatedAt).toBe("2026-10-01T00:00:00Z");
    expect(explanation.lastValidatedStrength).toBe("medium");
    expect(explanation.lastValidatedSourceType).toBe("retest");
  });

  it("returns insufficient evidence when none validated", () => {
    const explanation = explainDomainReadiness("python", [], [], asOf);
    expect(explanation.insufficientEvidence).toBe(true);
    expect(explanation.score).toBeNull();
    expect(explanation.evidenceLines).toHaveLength(0);
  });
});
