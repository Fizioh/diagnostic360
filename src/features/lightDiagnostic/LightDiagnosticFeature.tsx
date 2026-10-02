import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LIGHT_DIAGNOSTIC_QUESTIONS } from "../../domain/lightDiagnostic/questionBank";
import { buildLightDiagnosticResults } from "../../domain/lightDiagnostic/scoring";
import { applyLightDiagnosticResults } from "../../domain/lightDiagnostic/applyResults";
import { currentQuestion } from "../../domain/lightDiagnostic/session";
import { MODULES } from "../../data/modulesMeta";
import { useLightDiagnostic } from "../../hooks/useLightDiagnostic";
import { useWorkspace } from "../../hooks/useWorkspace";

function LightHome() {
  const { session, loading, startNew, reset, resume } = useLightDiagnostic();
  const navigate = useNavigate();

  if (loading) return <p className="p-8 text-muted">Loading…</p>;

  const canResume =
    session && (session.status === "active" || session.status === "paused") && session.responses.length > 0;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Link to="/diagnostic" className="text-xs text-muted hover:text-accent">
        ← Diagnostic hub
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-accent">Light Diagnostic</h1>
      <p className="mt-2 text-sm text-muted">Provisional baseline · {LIGHT_DIAGNOSTIC_QUESTIONS.length} questions</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {canResume ? (
          <>
            <button
              type="button"
              onClick={() => {
                resume();
                navigate("/diagnostic/light/session");
              }}
              className="rounded-md bg-amber-400/20 px-4 py-2 text-sm text-accent"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Reset progress and start over?")) {
                  await reset();
                  await startNew();
                  navigate("/diagnostic/light/session");
                }
              }}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted"
            >
              Restart
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={async () => {
              await startNew();
              navigate("/diagnostic/light/session");
            }}
            className="rounded-md bg-amber-400/20 px-4 py-2 text-sm text-accent"
          >
            Start Light Diagnostic
          </button>
        )}
      </div>
    </div>
  );
}

function LightSession() {
  const { session, loading, submitAnswer, pause, resume } = useLightDiagnostic();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const question = session ? currentQuestion(session) : null;

  useEffect(() => {
    if (!loading && session?.status === "complete") {
      navigate("/diagnostic/light/results", { replace: true });
    }
  }, [loading, session?.status, navigate]);

  useEffect(() => {
    if (session?.status === "paused") resume();
  }, [session?.status, resume]);

  useEffect(() => {
    if (!question) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") {
        setChoice(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question?.id]);

  if (loading || !session) return <p className="p-8 text-muted">Loading…</p>;
  if (!question) return <Navigate to="/diagnostic/light" replace />;

  const progress = session.responses.length;
  const total = LIGHT_DIAGNOSTIC_QUESTIONS.length;

  const confirm = async () => {
    if (choice == null || confidence == null) return;
    const next = await submitAnswer(question, choice, confidence);
    setChoice(null);
    setConfidence(null);
    if (next?.status === "complete") navigate("/diagnostic/light/results");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {question.domainLabel} · {question.difficulty}
        </span>
        <span>
          {progress + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-amber-400/70" style={{ width: `${((progress + 1) / total) * 100}%` }} />
      </div>
      <p className="mt-8 text-base leading-relaxed text-accent">{question.scenario}</p>
      <ul className="mt-6 space-y-2">
        {question.choices.map((c, i) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => setChoice(i)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                choice === i ? "border-amber-400/60 bg-amber-400/10" : "border-border text-muted hover:text-accent"
              }`}
            >
              <span className="mr-2 font-mono text-xs text-muted">{i + 1}</span>
              {c}
            </button>
          </li>
        ))}
      </ul>
      {choice != null && (
        <div className="mt-6">
          <p className="text-xs text-muted">Confidence (1 = guessing · 5 = certain)</p>
          <div className="mt-2 flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setConfidence(n)}
                className={`h-9 w-9 rounded border text-sm ${
                  confidence === n ? "border-amber-400 bg-amber-400/20" : "border-border text-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          disabled={choice == null || confidence == null}
          onClick={confirm}
          className="rounded-md bg-accent px-4 py-2 text-sm text-surface disabled:opacity-40"
        >
          Next
        </button>
        <button
          type="button"
          onClick={async () => {
            await pause();
            navigate("/diagnostic/light");
          }}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted"
        >
          Pause
        </button>
      </div>
    </div>
  );
}

function LightResults() {
  const { session, loading } = useLightDiagnostic();
  const { workspace, persist } = useWorkspace();
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (loading || !session || session.status !== "complete" || !workspace || applied) return;
    const results = buildLightDiagnosticResults(
      session.id,
      LIGHT_DIAGNOSTIC_QUESTIONS,
      session.responses,
      session.updatedAt,
    );
    const next = applyLightDiagnosticResults(workspace, results);
    persist(next);
    setApplied(true);
  }, [loading, session, workspace, persist, applied]);

  if (loading || !session || session.status !== "complete") {
    return <Navigate to="/diagnostic/light" replace />;
  }

  const results = buildLightDiagnosticResults(
    session.id,
    LIGHT_DIAGNOSTIC_QUESTIONS,
    session.responses,
    session.updatedAt,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">Provisional results</p>
      <h1 className="mt-2 text-2xl font-semibold text-accent">Light Diagnostic complete</h1>
      <p className="mt-2 text-sm text-muted">
        Overall provisional baseline: <span className="text-accent">{results.overallPercent}%</span> — not validated
        practical performance.
      </p>
      <section className="mt-8">
        <h2 className="text-sm font-medium text-accent">Domain breakdown</h2>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {results.domainScores
            .filter((d) => d.answered > 0)
            .map((d) => (
              <li key={d.domain} className="flex justify-between">
                <span>{d.label}</span>
                <span className="text-accent">
                  {d.percent}% ({d.correct}/{d.answered})
                </span>
              </li>
            ))}
        </ul>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-accent">Strongest signals</h2>
          <ul className="mt-1 text-xs text-muted">
            {results.strongest.map((d) => (
              <li key={d.domain}>{d.label} · {d.percent}%</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium text-accent">Weakest signals</h2>
          <ul className="mt-1 text-xs text-muted">
            {results.weakest.map((d) => (
              <li key={d.domain}>{d.label} · {d.percent}%</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-sm font-medium text-accent">Confidence calibration</h2>
        <ul className="mt-1 text-xs text-muted">
          {results.calibration.map((c) => (
            <li key={c.bucket}>
              {c.bucket}: {c.count}
            </li>
          ))}
        </ul>
      </section>
      {results.highConfidenceMistakes.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-accent">High-confidence incorrect</h2>
          <ul className="mt-2 space-y-2 text-xs text-muted">
            {results.highConfidenceMistakes.map((m) => (
              <li key={m.questionId} className="rounded border border-border/60 p-2">
                {m.scenario}…
              </li>
            ))}
          </ul>
        </section>
      )}
      {results.conceptsNeedingValidation.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-accent">Concepts needing deeper validation</h2>
          <p className="mt-1 text-xs text-muted">{results.conceptsNeedingValidation.join(" · ")}</p>
        </section>
      )}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-accent">Recommended Diagnostic 360 modules</h2>
        <ul className="mt-1 text-xs text-muted">
          {results.recommendedDiagnostic360Modules.map((id) => {
            const mod = MODULES.find((m) => m.id === id);
            return <li key={id}>{mod?.title ?? id}</li>;
          })}
        </ul>
      </section>
      <Link to="/" className="mt-8 inline-block text-sm text-accent hover:underline">
        Open cockpit →
      </Link>
    </div>
  );
}

export function LightDiagnosticFeature() {
  return (
    <Routes>
      <Route index element={<LightHome />} />
      <Route path="session" element={<LightSession />} />
      <Route path="results" element={<LightResults />} />
    </Routes>
  );
}
