import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useLocale } from "../../app/i18n/LocaleProvider";
import { LIGHT_DIAGNOSTIC_QUESTIONS } from "../../domain/lightDiagnostic/questionBank";
import { buildLightDiagnosticResults } from "../../domain/lightDiagnostic/scoring";
import { applyLightDiagnosticResults } from "../../domain/lightDiagnostic/applyResults";
import { getLocalizedLightQuestions, localizeLightQuestion } from "../../domain/lightDiagnostic/localizeQuestion";
import { presentLightQuestion } from "../../domain/lightDiagnostic/presentQuestion";
import { LightDiagnosticCodePanel } from "../../components/lightDiagnostic/LightDiagnosticCodePanel";
import { MODULES } from "../../data/modulesMeta";
import { useLightDiagnostic } from "../../hooks/useLightDiagnostic";
import { useWorkspace } from "../../hooks/useWorkspace";

function difficultyLabel(difficulty: "medium" | "hard", t: ReturnType<typeof useLocale>["t"]) {
  return difficulty === "hard" ? t.light.difficultyHard : t.light.difficultyMedium;
}

function LightHome() {
  const { t } = useLocale();
  const { session, loading, startNew, reset, resume } = useLightDiagnostic();
  const navigate = useNavigate();

  if (loading) return <p className="p-8 text-muted">{t.light.loading}</p>;

  const canResume =
    session && (session.status === "active" || session.status === "paused") && session.responses.length > 0;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Link to="/diagnostic" className="text-xs text-muted hover:text-accent">
        {t.light.hubBack}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-accent">{t.light.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.light.subtitle.replace("{count}", String(LIGHT_DIAGNOSTIC_QUESTIONS.length))}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {canResume ? (
          <>
            <button
              type="button"
              onClick={() => {
                resume();
                navigate("/diagnostic/light/session");
              }}
              className="cockpit-btn-primary"
            >
              {t.light.resume}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm(t.light.restartConfirm)) {
                  await reset();
                  await startNew();
                  navigate("/diagnostic/light/session");
                }
              }}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted"
            >
              {t.light.restart}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={async () => {
              await startNew();
              navigate("/diagnostic/light/session");
            }}
            className="cockpit-btn-primary"
          >
            {t.light.start}
          </button>
        )}
      </div>
    </div>
  );
}

function LightSession() {
  const { locale, t } = useLocale();
  const { session, loading, submitAnswer, pause, resume } = useLightDiagnostic();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const canonical = session ? LIGHT_DIAGNOSTIC_QUESTIONS[session.currentIndex] : null;
  const presented = useMemo(() => {
    if (!canonical || !session) return null;
    const localized = localizeLightQuestion(canonical, locale);
    return presentLightQuestion(localized, session.id);
  }, [canonical, session, locale]);
  const question = presented?.question ?? null;

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

  if (loading || !session) return <p className="p-8 text-muted">{t.light.loading}</p>;
  if (!question || !canonical || !presented) return <Navigate to="/diagnostic/light" replace />;

  const progress = session.responses.length;
  const total = LIGHT_DIAGNOSTIC_QUESTIONS.length;

  const confirm = async () => {
    if (choice == null || confidence == null) return;
    const next = await submitAnswer(canonical, presented.originalChoiceIndex(choice), confidence);
    setChoice(null);
    setConfidence(null);
    if (next?.status === "complete") navigate("/diagnostic/light/results");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {question.domainLabel} · {difficultyLabel(question.difficulty, t)}
        </span>
        <span>
          {progress + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-neon-cyan/70" style={{ width: `${((progress + 1) / total) * 100}%` }} />
      </div>
      <div className="mt-6">
        <LightDiagnosticCodePanel example={question.codeExample} />
      </div>
      <p className="mt-5 text-sm font-medium text-neon-cyan/90">{t.light.codePromptLabel}</p>
      <p className="mt-1 text-base leading-relaxed text-accent">{question.scenario}</p>
      <ul className="mt-5 space-y-2">
        {question.choices.map((c, i) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => setChoice(i)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                choice === i ? "border-neon-cyan/60 bg-neon-cyan/10" : "border-border text-muted hover:text-accent"
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
          <p className="text-xs text-muted">
            {t.light.confidence} ({t.light.confidenceHint})
          </p>
          <div className="mt-2 flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setConfidence(n)}
                className={`h-9 w-9 rounded border text-sm ${
                  confidence === n ? "border-neon-cyan bg-neon-cyan/20" : "border-border text-muted"
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
          className="cockpit-btn-primary disabled:opacity-40"
        >
          {t.light.next}
        </button>
        <button
          type="button"
          onClick={async () => {
            await pause();
            navigate("/diagnostic/light");
          }}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted"
        >
          {t.light.pause}
        </button>
      </div>
    </div>
  );
}

function calibrationLabel(bucket: string, t: ReturnType<typeof useLocale>["t"]) {
  switch (bucket) {
    case "correct-high":
      return t.light.calibrationCorrectHigh;
    case "correct-low":
      return t.light.calibrationCorrectLow;
    case "incorrect-high":
      return t.light.calibrationIncorrectHigh;
    case "incorrect-low":
      return t.light.calibrationIncorrectLow;
    default:
      return bucket;
  }
}

function LightResults() {
  const { locale, t } = useLocale();
  const { session, loading } = useLightDiagnostic();
  const { workspace, persist } = useWorkspace();
  const [applied, setApplied] = useState(false);

  const localizedQuestions = useMemo(() => getLocalizedLightQuestions(locale), [locale]);

  useEffect(() => {
    if (loading || !session || session.status !== "complete" || !workspace || applied) return;
    const results = buildLightDiagnosticResults(
      session.id,
      localizedQuestions,
      session.responses,
      session.updatedAt,
    );
    const next = applyLightDiagnosticResults(workspace, results);
    persist(next);
    setApplied(true);
  }, [loading, session, workspace, persist, applied, localizedQuestions]);

  if (loading || !session || session.status !== "complete") {
    return <Navigate to="/diagnostic/light" replace />;
  }

  const results = buildLightDiagnosticResults(
    session.id,
    localizedQuestions,
    session.responses,
    session.updatedAt,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-neon-amber/90">{t.light.provisionalResults}</p>
      <h1 className="mt-2 text-2xl font-semibold text-accent">{t.light.completeTitle}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.light.overallLine} <span className="text-accent">{results.overallPercent}%</span> {t.light.notValidated}
      </p>
      <section className="mt-8">
        <h2 className="text-sm font-medium text-accent">{t.light.domainBreakdown}</h2>
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
          <h2 className="text-sm font-medium text-accent">{t.light.strongest}</h2>
          <ul className="mt-1 text-xs text-muted">
            {results.strongest.map((d) => (
              <li key={d.domain}>
                {d.label} · {d.percent}%
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium text-accent">{t.light.weakest}</h2>
          <ul className="mt-1 text-xs text-muted">
            {results.weakest.map((d) => (
              <li key={d.domain}>
                {d.label} · {d.percent}%
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-sm font-medium text-accent">{t.light.calibration}</h2>
        <ul className="mt-1 text-xs text-muted">
          {results.calibration.map((c) => (
            <li key={c.bucket}>
              {calibrationLabel(c.bucket, t)}: {c.count}
            </li>
          ))}
        </ul>
      </section>
      {results.highConfidenceMistakes.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-accent">{t.light.highConfidenceIncorrect}</h2>
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
          <h2 className="text-sm font-medium text-accent">{t.light.conceptsNeeding}</h2>
          <p className="mt-1 text-xs text-muted">{results.conceptsNeedingValidation.join(" · ")}</p>
        </section>
      )}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-accent">{t.light.recommendedModules}</h2>
        <ul className="mt-1 text-xs text-muted">
          {results.recommendedDiagnostic360Modules.map((id) => {
            const mod = MODULES.find((m) => m.id === id);
            return <li key={id}>{mod?.title ?? id}</li>;
          })}
        </ul>
      </section>
      <Link to="/" className="cockpit-link mt-8 inline-block text-sm">
        {t.light.openCockpit}
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
