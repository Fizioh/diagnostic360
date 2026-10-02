import { describe, expect, it } from "vitest";
import { computeDomainReadiness } from "./computeReadiness";
import type { EvidenceItem } from "../types";

describe("computeDomainReadiness", () => {
  it("returns insufficient evidence when no validated items", () => {
    const view = computeDomainReadiness("django", []);
    expect(view.insufficientEvidence).toBe(true);
    expect(view.score).toBeNull();
  });

  it("computes score from strong evidence", () => {
    const evidence: EvidenceItem[] = [
      {
        id: "1",
        domain: "django",
        strength: "strong",
        title: "Diagnostic review",
        description: "External review",
        validatedAt: "2026-10-01T00:00:00Z",
        sourceType: "diagnostic",
      },
    ];
    const view = computeDomainReadiness("django", evidence);
    expect(view.insufficientEvidence).toBe(false);
    expect(view.score).toBeGreaterThan(0);
  });
});
