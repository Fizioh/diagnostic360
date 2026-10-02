# Domain model (v1)

## MissionWorkspaceV1

| Entity | Purpose |
|--------|---------|
| PreparationTask | Executable work item (Notion or local) |
| EvidenceItem | Validated proof affecting readiness |
| WeaknessItem | Gap from review / error log |
| RetestItem | Scheduled verification of weakness |

## Readiness

Computed from **validated** evidence only (`validatedAt` required). Weak evidence alone does not imply readiness.

Evidence contribution: strength weight (strong 3 · medium 1.5 · weak 0.25) × recency decay (90-day half-life). Score normalised against reference weight 6 → 0–100.

Self-reported module confidence (1–5) is stored on diagnostic-sourced evidence **for calibration only** (over / under / aligned vs review strength) — it does not inflate the readiness score.

Display **Insufficient evidence** when no validated proof exists for a domain.

## DiagnosticRun

Stored separately during KHA-180 integration; exports JSON for external LLM review.

## Events (future)

`TaskCompleted`, `EvidenceRecorded`, `WeaknessOpened`, `RetestPassed` — for audit and recomputation.
