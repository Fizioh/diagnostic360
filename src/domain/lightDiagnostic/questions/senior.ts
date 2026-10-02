import { mcq } from "./helpers";

export const seniorQuestions = [
  mcq(
    "ld-senior-01",
    "senior-communication",
    "Senior Engineering / Communication",
    "medium",
    "Team proposes rewrite; system has revenue-critical bugs but stable features. Your stance in architecture review?",
    [
      "Advocate incremental strangler with measurable SLO targets and rollback, document risk of big-bang rewrite",
      "Approve full rewrite immediately",
      "Refuse all change",
      "Delegate decision to intern",
    ],
    0,
    "Senior communication balances risk, business continuity, and measurable migration.",
    ["architecture review", "rewrite vs evolve", "stakeholders"],
  ),
  mcq(
    "ld-senior-02",
    "senior-communication",
    "Senior Engineering / Communication",
    "hard",
    "Incident postmortem: blameful tone toward on-call. Best facilitation move?",
    [
      "Focus on timeline, contributing factors, and actionable follow-ups; separate people from systems",
      "Name individuals at fault publicly",
      "Skip postmortem",
      "Publish raw chat logs externally",
    ],
    0,
    "Blameless postmortems improve learning and reduce fear of reporting.",
    ["incident review", "blameless culture"],
  ),
  mcq(
    "ld-senior-03",
    "senior-communication",
    "Senior Engineering / Communication",
    "medium",
    "Product wants date for multi-team dependency; engineering uncertainty is high. Response?",
    [
      "Commit fixed date to please sales",
      "Offer range with assumptions, milestones, and explicit unknowns; propose spike to reduce uncertainty",
      "Say never",
      "Ignore product",
    ],
    1,
    "Transparent ranges and discovery work are senior-level expectation setting.",
    ["estimation", "cross-team communication", "risk"],
  ),
];
