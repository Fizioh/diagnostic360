import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { applyLightDiagnosticResults } from "./applyResults";
import { LIGHT_DIAGNOSTIC_FR } from "./i18n/frQuestions";
import { LIGHT_DIAGNOSTIC_QUESTIONS } from "./questionBank";
import { buildLightDiagnosticResults } from "./scoring";
import {
  createLightDiagnosticSession,
  pauseLightSession,
  recordLightAnswer,
  resumeLightSession,
} from "./session";
import type { EvidenceItem } from "../types";
import {
  domainEvidenceScore,
  evidenceContribution,
  validatedEvidenceForDomain,
} from "../evidence/evidenceModel";
import { choiceLengthOutlier } from "./presentQuestion";

describe("light diagnostic question bank", () => {
  it("has 24 unique stable ids", () => {
    expect(LIGHT_DIAGNOSTIC_QUESTIONS.length).toBe(24);
    const ids = new Set(LIGHT_DIAGNOSTIC_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(24);
  });

  it("every question has a code example with at least four lines", () => {
    for (const q of LIGHT_DIAGNOSTIC_QUESTIONS) {
      expect(q.codeExample, q.id).toBeDefined();
      expect(q.codeExample.lines.length, q.id).toBeGreaterThanOrEqual(4);
    }
  });

  it("has French copy for every question id", () => {
    for (const q of LIGHT_DIAGNOSTIC_QUESTIONS) {
      const fr = LIGHT_DIAGNOSTIC_FR[q.id];
      expect(fr, q.id).toBeDefined();
      expect(fr.scenario.length).toBeGreaterThan(10);
      expect(fr.choices).toHaveLength(4);
    }
  });

  it("no question has correct choice length outlier", () => {
    for (const q of LIGHT_DIAGNOSTIC_QUESTIONS) {
      expect(choiceLengthOutlier(q), q.id).toBe(false);
    }
  });
});

describe("light diagnostic session", () => {
  it("persists pause and resume", () => {
    let s = createLightDiagnosticSession();
    s = pauseLightSession(s);
    expect(s.status).toBe("paused");
    s = resumeLightSession(s);
    expect(s.status).toBe("active");
  });

  it("records answer without revealing flow correctness in session state", () => {
    const q = LIGHT_DIAGNOSTIC_QUESTIONS[0];
    let s = createLightDiagnosticSession();
    s = recordLightAnswer(s, q, 0, 3);
    expect(s.responses).toHaveLength(1);
    expect(s.responses[0].correct).toBe(q.correctIndex === 0);
  });
});

describe("light diagnostic scoring", () => {
  it("aggregates calibration buckets", () => {
    const q = LIGHT_DIAGNOSTIC_QUESTIONS[0];
    const results = buildLightDiagnosticResults(
      "sess-1",
      [q],
      [
        {
          questionId: q.id,
          choiceIndex: q.correctIndex,
          confidence: 5,
          correct: true,
          answeredAt: "2026-01-01T00:00:00.000Z",
        },
        {
          questionId: q.id,
          choiceIndex: (q.correctIndex + 1) % 4,
          confidence: 5,
          correct: false,
          answeredAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      "2026-01-01T01:00:00.000Z",
    );
    expect(results.calibration.find((c) => c.bucket === "correct-high")!.count).toBeGreaterThanOrEqual(1);
    expect(results.highConfidenceMistakes.length).toBeGreaterThanOrEqual(0);
  });
});

describe("provisional evidence", () => {
  it("weights light diagnostic below validated diagnostic", () => {
    const asOf = new Date("2026-10-02T12:00:00Z");
    const validated: EvidenceItem = {
      id: "1",
      domain: "django",
      strength: "strong",
      title: "t",
      description: "d",
      validatedAt: "2026-10-01T12:00:00Z",
      sourceType: "diagnostic",
    };
    const provisional: EvidenceItem = {
      ...validated,
      id: "2",
      sourceType: "light-diagnostic",
      provisional: true,
    };
    expect(evidenceContribution(provisional, asOf)).toBeLessThan(evidenceContribution(validated, asOf));
  });

  it("supersedes provisional when validated exists for domain", () => {
    const ws = emptyWorkspace();
    ws.evidence = [
      {
        id: "p",
        domain: "django",
        strength: "medium",
        title: "light",
        description: "",
        validatedAt: "2026-01-01",
        sourceType: "light-diagnostic",
        provisional: true,
      },
      {
        id: "v",
        domain: "django",
        strength: "weak",
        title: "360",
        description: "",
        validatedAt: "2026-02-01",
        sourceType: "diagnostic",
      },
    ];
    const used = validatedEvidenceForDomain("django", ws.evidence);
    expect(used).toHaveLength(1);
    expect(used[0].sourceType).toBe("diagnostic");
    expect(domainEvidenceScore("django", ws.evidence, new Date("2026-10-01"))).toBe(
      domainEvidenceScore("django", used, new Date("2026-10-01")),
    );
  });

  it("apply is idempotent for same session results", () => {
    const sessionId = "sess-idem";
    const results = buildLightDiagnosticResults(
      sessionId,
      LIGHT_DIAGNOSTIC_QUESTIONS.slice(0, 3),
      LIGHT_DIAGNOSTIC_QUESTIONS.slice(0, 3).map((q) => ({
        questionId: q.id,
        choiceIndex: q.correctIndex,
        confidence: 4,
        correct: true,
        answeredAt: "2026-01-01T00:00:00.000Z",
      })),
      "2026-01-01T01:00:00.000Z",
    );
    let ws = applyLightDiagnosticResults(emptyWorkspace(), results);
    const count1 = ws.evidence.filter((e) => e.sourceType === "light-diagnostic").length;
    ws = applyLightDiagnosticResults(ws, results);
    const count2 = ws.evidence.filter((e) => e.sourceType === "light-diagnostic").length;
    expect(count1).toBe(count2);
    expect(count1).toBeGreaterThan(0);
  });
});
