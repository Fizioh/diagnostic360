import { describe, expect, it } from "vitest";
import type { EvidenceItem } from "../types";
import {
  computeConfidenceCalibration,
  domainEvidenceScore,
  evidenceContribution,
  recencyFactor,
} from "./evidenceModel";

const base: EvidenceItem = {
  id: "1",
  domain: "django",
  strength: "strong",
  title: "t",
  description: "d",
  validatedAt: "2026-10-01T12:00:00Z",
  sourceType: "diagnostic",
};

describe("evidenceModel", () => {
  it("applies recency decay", () => {
    const fresh = recencyFactor("2026-10-01T12:00:00Z", new Date("2026-10-02T12:00:00Z"));
    const old = recencyFactor("2026-01-01T12:00:00Z", new Date("2026-10-01T12:00:00Z"));
    expect(fresh).toBeGreaterThan(old);
  });

  it("weights strong above weak", () => {
    const asOf = new Date("2026-10-02T12:00:00Z");
    const strong = evidenceContribution(base, asOf);
    const weak = evidenceContribution({ ...base, strength: "weak" }, asOf);
    expect(strong).toBeGreaterThan(weak);
  });

  it("calibrates self-confidence vs validation strength", () => {
    const evidence: EvidenceItem[] = [
      {
        ...base,
        confidence: 95,
        strength: "weak",
      },
    ];
    expect(computeConfidenceCalibration("django", evidence)).toBe("overconfident");
  });

  it("computes domain score from validated weighted evidence", () => {
    const score = domainEvidenceScore("django", [base], new Date("2026-10-02T12:00:00Z"));
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0);
  });
});
