import { CodeEditor } from "./CodeEditor";
import { FieldBlock, TextAreaField } from "./FieldBlock";
import { INCIDENT_ACTIONS, INCIDENT_BRIEF } from "../data/incidentSim";
import { SD_INITIAL, SD_REVEALS } from "../data/systemDesignReveal";
import type { DiagnosticRun, ModuleId } from "../types/diagnostic";

interface ModulePanelProps {
  moduleId: ModuleId;
  run: DiagnosticRun;
  onPatch: (patch: Record<string, string | string[]>) => void;
  onRevealHint: (hintId: string) => void;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function ModulePanel({ moduleId, run, onPatch, onRevealHint }: ModulePanelProps) {
  const a = run.answers[moduleId] ?? {};

  if (moduleId === "coding") {
    const lang = str(a.language) || "typescript";
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited for this module.
        </div>
        <div className="prose prose-invert max-w-none text-sm text-muted">
          <p className="text-accent">Implement:</p>
          <pre className="overflow-x-auto rounded-md border border-border bg-[#0a0b0e] p-4 font-mono text-xs text-accent/90">
            {`detectBursts(events, windowSeconds, threshold)

events: { userId: string; timestamp: number }[]  // sorted
Return userIds with ≥ threshold events in any sliding window of windowSeconds.

Constraints: up to 1M events, windowSeconds ≥ 1, threshold ≥ 2`}
          </pre>
        </div>
        <FieldBlock label="Language">
          <select
            value={lang}
            onChange={(e) => onPatch({ language: e.target.value })}
            className="rounded-md border border-border bg-panel px-3 py-2 font-mono text-sm"
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </FieldBlock>
        <FieldBlock label="Reasoning & complexity">
          <TextAreaField value={str(a.reasoning)} onChange={(v) => onPatch({ reasoning: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="Edge cases">
          <TextAreaField value={str(a.edgeCases)} onChange={(v) => onPatch({ edgeCases: v })} rows={4} />
        </FieldBlock>
        <FieldBlock label="Implementation">
          <CodeEditor
            language={lang}
            value={str(a.implementation)}
            onChange={(v) => onPatch({ implementation: v })}
            rows={18}
          />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "react-ts") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited for this module.
        </div>
        <p className="text-sm text-muted">
          Debounced search sends requests A then B. B returns first; A returns later and overwrites UI with stale
          results.
        </p>
        <CodeEditor
          language="tsx"
          readOnly
          value={`// Simplified buggy pattern
const [q, setQ] = useState("");
const [results, setResults] = useState<Item[]>([]);

useEffect(() => {
  const t = setTimeout(async () => {
    const data = await searchApi(q);
    setResults(data);
  }, 300);
  return () => clearTimeout(t);
}, [q]);`}
          onChange={() => {}}
          rows={12}
        />
        <FieldBlock label="Diagnosis">
          <TextAreaField value={str(a.diagnosis)} onChange={(v) => onPatch({ diagnosis: v })} />
        </FieldBlock>
        <FieldBlock label="Architecture & cancellation strategy">
          <TextAreaField value={str(a.architecture)} onChange={(v) => onPatch({ architecture: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="Corrected implementation">
          <CodeEditor
            language="tsx"
            value={str(a.fix)}
            onChange={(v) => onPatch({ fix: v })}
            rows={14}
          />
        </FieldBlock>
        <FieldBlock label="Stale closures, memoization, types (type vs interface)">
          <TextAreaField value={str(a.deepDive)} onChange={(v) => onPatch({ deepDive: v })} rows={6} />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "django-sql") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited for this module.
        </div>
        <pre className="rounded-md border border-border bg-[#0a0b0e] p-4 font-mono text-xs text-accent/90 whitespace-pre-wrap">
          {`GET /projects/:id/routes
before: 350ms → now: 4.2s
DB CPU: high · traffic: +30% · payload: almost unchanged

Serializer touches:
- route.owner.name
- route.system.region.name
- route.crossings.count()`}
        </pre>
        <FieldBlock label="Diagnostic plan (ordered steps)">
          <TextAreaField value={str(a.plan)} onChange={(v) => onPatch({ plan: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="Ranked hypotheses">
          <TextAreaField value={str(a.hypotheses)} onChange={(v) => onPatch({ hypotheses: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="ORM strategy (select_related / prefetch_related)">
          <TextAreaField value={str(a.orm)} onChange={(v) => onPatch({ orm: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="Indexing, pagination, perf tests">
          <TextAreaField value={str(a.indexing)} onChange={(v) => onPatch({ indexing: v })} rows={5} />
        </FieldBlock>
        <FieldBlock label="SQL — latest event per route">
          <CodeEditor
            language="sql"
            value={str(a.sql)}
            onChange={(v) => onPatch({ sql: v })}
            rows={10}
            placeholder="Write PostgreSQL query..."
          />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "code-review") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited · Do not blindly refactor — some patterns may be acceptable.
        </div>
        <CodeEditor
          language="python"
          readOnly
          value={`# views.py — excerpt
def route_bulk_update(request):
    ids = request.data.get("ids", [])
    for rid in ids:
        route = Route.objects.get(pk=rid)
        route.status = "active"
        route.save(update_fields=["status"])
    return Response({"ok": True})`}
          onChange={() => {}}
          rows={10}
        />
        <CodeEditor
          language="tsx"
          readOnly
          value={`// React — excerpt
useEffect(() => {
  fetchRoutes(projectId).then(setRoutes);
}, [projectId, refreshToken]);`}
          onChange={() => {}}
          rows={6}
        />
        <FieldBlock label="Findings (issue, severity, evidence, fix, test)">
          <TextAreaField value={str(a.findings)} onChange={(v) => onPatch({ findings: v })} rows={12} />
        </FieldBlock>
        <FieldBlock label="What you intentionally did NOT change">
          <TextAreaField value={str(a.accepted)} onChange={(v) => onPatch({ accepted: v })} rows={4} />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "system-design") {
    const revealed = strArr(a.revealedIds);
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited · Reveal constraints only after clarification questions.
        </div>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-panel p-4 text-sm text-muted">
          {SD_INITIAL}
        </pre>
        <FieldBlock label="Clarification questions">
          <TextAreaField value={str(a.questions)} onChange={(v) => onPatch({ questions: v })} rows={6} />
        </FieldBlock>
        <div className="flex flex-wrap gap-2">
          {SD_REVEALS.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={revealed.includes(r.id)}
              onClick={() => {
                onRevealHint(r.id);
                onPatch({ revealedIds: [...revealed, r.id] });
              }}
              className="rounded border border-border px-3 py-1.5 font-mono text-[10px] hover:border-accent/40 disabled:opacity-40"
            >
              Reveal: {r.title}
            </button>
          ))}
        </div>
        {SD_REVEALS.filter((r) => revealed.includes(r.id)).map((r) => (
          <div key={r.id} className="rounded-md border border-border bg-[#0a0b0e] p-4 text-sm text-muted">
            <p className="font-mono text-xs text-accent">{r.title}</p>
            <p className="mt-2">{r.body}</p>
          </div>
        ))}
        <FieldBlock label="Architecture (API, ingestion, PostGIS, Redis, queues, tenancy, observability)">
          <TextAreaField value={str(a.architecture)} onChange={(v) => onPatch({ architecture: v })} rows={12} />
        </FieldBlock>
        <FieldBlock label="Optional diagram / canvas notes">
          <TextAreaField
            value={str(a.diagram)}
            onChange={(v) => onPatch({ diagram: v })}
            rows={8}
            placeholder="ASCII diagram, component list, or drawing notes..."
          />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "production") {
    const taken = strArr(a.actionsTaken);
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited · Incident simulator — evidence reveals progressively.
        </div>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-[#0a0b0e] p-4 font-mono text-xs text-accent/90">
          {INCIDENT_BRIEF}
        </pre>
        <FieldBlock label="Immediate triage (first 10 minutes)">
          <TextAreaField value={str(a.triage)} onChange={(v) => onPatch({ triage: v })} rows={5} />
        </FieldBlock>
        <div className="flex flex-wrap gap-2">
          {INCIDENT_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={taken.includes(action.id)}
              onClick={() => {
                onRevealHint(`incident-${action.id}`);
                onPatch({ actionsTaken: [...taken, action.id] });
              }}
              className="rounded border border-border px-3 py-2 font-mono text-[10px] hover:border-accent/40 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
        {INCIDENT_ACTIONS.filter((x) => taken.includes(x.id)).map((action) => (
          <div key={action.id} className="rounded-md border border-signal/30 bg-signal/5 p-3 text-sm text-muted">
            <p className="font-mono text-xs text-signal">{action.label}</p>
            <p className="mt-1">{action.evidence}</p>
          </div>
        ))}
        <FieldBlock label="Root cause, mitigation, permanent fix, postmortem">
          <TextAreaField value={str(a.postmortem)} onChange={(v) => onPatch({ postmortem: v })} rows={8} />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "ai-engineering") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-signal/40 bg-signal/10 px-4 py-2 font-mono text-xs text-signal">
          AI tools allowed for this module.
        </div>
        <CodeEditor
          language="python"
          readOnly
          value={`def process_payment(task):
    payment = Payment.objects.get(id=task.payment_id)
    result = provider.charge(
        payment.customer_id,
        payment.amount,
    )
    payment.status = "paid"
    payment.provider_id = result.id
    payment.save()
    task.status = "done"
    task.save()`}
          onChange={() => {}}
          rows={14}
        />
        <FieldBlock label="Merge decision & rationale">
          <TextAreaField value={str(a.mergeDecision)} onChange={(v) => onPatch({ mergeDecision: v })} rows={4} />
        </FieldBlock>
        <FieldBlock label="Risk analysis (idempotency, retries, transactions, concurrency, tests)">
          <TextAreaField value={str(a.risks)} onChange={(v) => onPatch({ risks: v })} rows={8} />
        </FieldBlock>
        <FieldBlock label="How you use AI without delegating judgment">
          <TextAreaField value={str(a.aiUsage)} onChange={(v) => onPatch({ aiUsage: v })} rows={5} />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "gis") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited
        </div>
        <p className="text-sm text-accent">
          PM: “We have five million geographical features. Can&apos;t Django simply return them all and let the browser
          render them?”
        </p>
        <FieldBlock label="Your response (bbox, indexes, tiles, clustering, LOD, projections…)">
          <TextAreaField value={str(a.response)} onChange={(v) => onPatch({ response: v })} rows={14} />
        </FieldBlock>
      </div>
    );
  }

  if (moduleId === "communication") {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
          AI prohibited
        </div>
        <p className="text-sm text-accent">
          CTO: “Let&apos;s replace PostgreSQL + Redis with MongoDB to simplify the stack.”
        </p>
        <FieldBlock label="Response for a CTO (recommendation, risks, trade-offs, when you would change mind)">
          <TextAreaField value={str(a.response)} onChange={(v) => onPatch({ response: v })} rows={14} />
        </FieldBlock>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-4 py-2 font-mono text-xs text-amber-200/90">
        Technical English — answer in English only.
      </div>
      <FieldBlock label="Tell me about a difficult production issue you diagnosed.">
        <TextAreaField value={str(a.story)} onChange={(v) => onPatch({ story: v })} rows={8} />
      </FieldBlock>
      <FieldBlock label="What alternatives did you consider?">
        <TextAreaField value={str(a.alternatives)} onChange={(v) => onPatch({ alternatives: v })} rows={4} />
      </FieldBlock>
      <FieldBlock label="What would you do differently today?">
        <TextAreaField value={str(a.differently)} onChange={(v) => onPatch({ differently: v })} rows={4} />
      </FieldBlock>
      <FieldBlock label="How did you know the issue was actually resolved?">
        <TextAreaField value={str(a.validation)} onChange={(v) => onPatch({ validation: v })} rows={4} />
      </FieldBlock>
    </div>
  );
}
