# Domain model (v1)

## MissionWorkspaceV1

| Entity | Purpose |
|--------|---------|
| PreparationTask | Executable work item (Notion or local) |
| EvidenceItem | Validated proof affecting readiness |
| WeaknessItem | Gap from review / error log |
| RetestItem | Scheduled verification of weakness |

## Readiness

Computed from **validated** evidence only. Weak evidence alone does not imply readiness.

Display **Insufficient evidence** when no validated proof exists for a domain.

## DiagnosticRun

Stored separately during KHA-180 integration; exports JSON for external LLM review.

## Events (future)

`TaskCompleted`, `EvidenceRecorded`, `WeaknessOpened`, `RetestPassed` — for audit and recomputation.
