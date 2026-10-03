import { INCIDENT_BRIEF } from "../../data/incidentSim";
import { SD_INITIAL } from "../../data/systemDesignReveal";
import type { ModuleId } from "../../types/diagnostic";
import type { ModuleExerciseDefinition } from "./answerModes";

const CODING_STARTER = `function detectBursts(events, windowSeconds, threshold) {
  // events: { userId: string, timestamp: number }[] sorted by timestamp
  // Return userIds with >= threshold events in any sliding window of windowSeconds
  return [];
}
`;

const REACT_BUG = `// Simplified buggy pattern
const [q, setQ] = useState("");
const [results, setResults] = useState<Item[]>([]);

useEffect(() => {
  const t = setTimeout(async () => {
    const data = await searchApi(q);
    setResults(data);
  }, 300);
  return () => clearTimeout(t);
}, [q]);`;

const DJANGO_SQL_SCHEMA = `-- Reference schema (PostgreSQL)
-- route(id, project_id, owner_id, system_id, ...)
-- route_event(id, route_id, created_at, kind)
-- owner(id, name)
-- system(id, region_id)
-- region(id, name)`;

const exercises: Record<ModuleId, ModuleExerciseDefinition> = {
  coding: {
    moduleId: "coding",
    answerMode: "CODE",
    sansIa: true,
    executionProfileId: "browser-js-burst-detector",
    problem: [
      {
        heading: "Implement",
        body: `detectBursts(events, windowSeconds, threshold)

events: { userId: string; timestamp: number }[]  // sorted
Return userIds with ≥ threshold events in any sliding window of windowSeconds.

Constraints: up to 1M events, windowSeconds ≥ 1, threshold ≥ 2`,
        monospace: true,
      },
    ],
    codeFields: [
      {
        answerKey: "implementation",
        label: "Implementation",
        language: "typescript",
        starterCode: CODING_STARTER,
        minHeight: "320px",
      },
    ],
    structuredFields: [
      { answerKey: "reasoning", label: "Reasoning & complexity", rows: 5 },
      { answerKey: "edgeCases", label: "Edge cases", rows: 4 },
    ],
  },
  "react-ts": {
    moduleId: "react-ts",
    answerMode: "CODE",
    sansIa: true,
    problem: [
      {
        body: "Debounced search sends requests A then B. B returns first; A returns later and overwrites UI with stale results.",
      },
    ],
    codeFields: [
      { answerKey: "_bugSnippet", label: "Buggy pattern", language: "tsx", readOnly: true, starterCode: REACT_BUG },
      { answerKey: "fix", label: "Corrected implementation", language: "tsx", minHeight: "280px" },
    ],
    structuredFields: [
      { answerKey: "diagnosis", label: "Diagnosis" },
      { answerKey: "architecture", label: "Architecture & cancellation strategy", rows: 5 },
      { answerKey: "deepDive", label: "Stale closures, memoization, types", rows: 6 },
    ],
  },
  "django-sql": {
    moduleId: "django-sql",
    answerMode: "SQL",
    sansIa: true,
    sqlSchema: DJANGO_SQL_SCHEMA,
    problem: [
      {
        body: `GET /projects/:id/routes
before: 350ms → now: 4.2s
DB CPU: high · traffic: +30% · payload: almost unchanged

Serializer touches:
- route.owner.name
- route.system.region.name
- route.crossings.count()`,
        monospace: true,
      },
    ],
    structuredFields: [
      { answerKey: "plan", label: "Diagnostic plan (ordered steps)", rows: 5 },
      { answerKey: "hypotheses", label: "Ranked hypotheses", rows: 5 },
      { answerKey: "orm", label: "ORM strategy (select_related / prefetch_related)", rows: 5 },
      { answerKey: "indexing", label: "Indexing, pagination, perf tests", rows: 5 },
    ],
    codeFields: [
      {
        answerKey: "sql",
        label: "SQL — latest event per route",
        language: "sql",
        starterCode: "-- PostgreSQL\nSELECT ",
        minHeight: "200px",
      },
    ],
  },
  "code-review": {
    moduleId: "code-review",
    answerMode: "TEXT",
    sansIa: true,
    showWordCount: true,
    problem: [
      {
        body: "Review the excerpts. Do not blindly refactor — some patterns may be acceptable.",
      },
    ],
    codeFields: [
      {
        answerKey: "_pyExcerpt",
        label: "views.py excerpt",
        language: "python",
        readOnly: true,
        starterCode: `# views.py — excerpt
def route_bulk_update(request):
    ids = request.data.get("ids", [])
    for rid in ids:
        route = Route.objects.get(pk=rid)
        route.status = "active"
        route.save(update_fields=["status"])
    return Response({"ok": True})`,
      },
      {
        answerKey: "_tsxExcerpt",
        label: "React excerpt",
        language: "tsx",
        readOnly: true,
        starterCode: `useEffect(() => {
  fetchRoutes(projectId).then(setRoutes);
}, [projectId, refreshToken]);`,
      },
    ],
    structuredFields: [
      { answerKey: "findings", label: "Findings (issue, severity, evidence, fix, test)", rows: 12 },
      { answerKey: "accepted", label: "What you intentionally did NOT change", rows: 4 },
    ],
  },
  "system-design": {
    moduleId: "system-design",
    answerMode: "STRUCTURED",
    sansIa: true,
    problem: [{ body: SD_INITIAL, monospace: true }],
    structuredFields: [
      { answerKey: "questions", label: "Clarification questions", rows: 6 },
      { answerKey: "assumptions", label: "Assumptions", rows: 4 },
      { answerKey: "hypotheses", label: "Hypotheses / approach", rows: 5 },
      { answerKey: "architecture", label: "Solution architecture", rows: 12 },
      { answerKey: "tradeoffs", label: "Trade-offs", rows: 5 },
      { answerKey: "failureModes", label: "Failure modes", rows: 4 },
      { answerKey: "validation", label: "Validation strategy", rows: 4 },
      { answerKey: "diagram", label: "Optional diagram / canvas notes", rows: 8 },
    ],
  },
  production: {
    moduleId: "production",
    answerMode: "INCIDENT",
    sansIa: true,
    problem: [{ heading: "Incident brief", body: INCIDENT_BRIEF, monospace: true }],
    structuredFields: [
      { answerKey: "triage", label: "Immediate triage (first 10 minutes)", rows: 5 },
      { answerKey: "hypotheses", label: "Hypotheses", rows: 5 },
      { answerKey: "actionsLog", label: "Actions taken (narrative)", rows: 4 },
      { answerKey: "finalDiagnosis", label: "Final diagnosis", rows: 5 },
      { answerKey: "postmortem", label: "Mitigation, permanent fix, postmortem", rows: 8 },
    ],
  },
  "ai-engineering": {
    moduleId: "ai-engineering",
    answerMode: "TEXT",
    sansIa: false,
    problem: [{ body: "AI tools allowed. Review the payment task handler and decide on merge." }],
    codeFields: [
      {
        answerKey: "_snippet",
        label: "Task handler",
        language: "python",
        readOnly: true,
        starterCode: `def process_payment(task):
    payment = Payment.objects.get(id=task.payment_id)
    result = provider.charge(
        payment.customer_id,
        payment.amount,
    )
    payment.status = "paid"
    payment.provider_id = result.id
    payment.save()
    task.status = "done"
    task.save()`,
      },
    ],
    structuredFields: [
      { answerKey: "mergeDecision", label: "Merge decision & rationale", rows: 4 },
      { answerKey: "risks", label: "Risk analysis", rows: 8 },
      { answerKey: "aiUsage", label: "How you use AI without delegating judgment", rows: 5 },
    ],
  },
  gis: {
    moduleId: "gis",
    answerMode: "TEXT",
    sansIa: true,
    showWordCount: true,
    problem: [
      {
        body: "PM: “We have five million geographical features. Can't Django simply return them all and let the browser render them?”",
      },
    ],
    structuredFields: [
      {
        answerKey: "response",
        label: "Your response (bbox, indexes, tiles, clustering, LOD, projections…)",
        rows: 14,
      },
    ],
  },
  communication: {
    moduleId: "communication",
    answerMode: "TEXT",
    sansIa: true,
    showWordCount: true,
    problem: [
      {
        body: "CTO: “Let's replace PostgreSQL + Redis with MongoDB to simplify the stack.”",
      },
    ],
    structuredFields: [
      {
        answerKey: "response",
        label: "Response for a CTO (recommendation, risks, trade-offs)",
        rows: 14,
      },
    ],
  },
  english: {
    moduleId: "english",
    answerMode: "TEXT",
    sansIa: true,
    showWordCount: true,
    problem: [{ body: "Technical English — answer in English only." }],
    structuredFields: [
      { answerKey: "story", label: "Tell me about a difficult production issue you diagnosed.", rows: 8 },
      { answerKey: "alternatives", label: "What alternatives did you consider?", rows: 4 },
      { answerKey: "differently", label: "What would you do differently today?", rows: 4 },
      { answerKey: "validation", label: "How did you know the issue was actually resolved?", rows: 4 },
    ],
  },
};

export function getModuleExercise(moduleId: ModuleId): ModuleExerciseDefinition {
  return exercises[moduleId];
}

export function starterForField(exercise: ModuleExerciseDefinition, answerKey: string): string | undefined {
  return exercise.codeFields?.find((f) => f.answerKey === answerKey)?.starterCode;
}
