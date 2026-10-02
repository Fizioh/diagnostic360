import { mcq } from "./helpers";

export const seniorQuestions = [
  mcq(
    "ld-senior-01",
    "senior-communication",
    "Senior Engineering / Communication",
    "medium",
    "Team proposes rewrite; system has revenue-critical bugs but stable features. Your stance in architecture review?",
    [
      "Advocate an incremental strangler with measurable SLO targets, rollback paths, and documented big-bang risk",
      "Approve an immediate full rewrite timeline so the team can fix structural issues in one coordinated push",
      "Block all structural change until revenue-critical bugs are zero, including incremental extraction work",
      "Defer the architecture decision to the most junior engineer present so the team practices ownership",
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
      "Steer the review toward timeline, contributing factors, and actionable follow-ups separate from people",
      "Call out responsible individuals in the meeting so accountability is clear before publishing the doc",
      "Cancel the postmortem when tone turns blameful and revisit only after leadership selects a scapegoat",
      "Publish raw chat transcripts externally so the community can judge who caused the outage fairly",
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
      "Commit a fixed ship date to unblock sales even though engineering confidence in the estimate is low",
      "Offer a date range with stated assumptions, milestones, unknowns, and a spike to reduce uncertainty",
      "Decline to discuss dates until every unknown is resolved so product cannot plan downstream work",
      "Stop attending product planning sessions until stakeholders accept that engineering cannot estimate",
    ],
    1,
    "Transparent ranges and discovery work are senior-level expectation setting.",
    ["estimation", "cross-team communication", "risk"],
  ),
];
