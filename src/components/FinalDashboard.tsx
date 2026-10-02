import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { buildReviewTemplate } from "../domain/diagnostic/externalReview";

import {

  importExternalReviewJson,

  previewReviewImport,

  type ReviewImportPreview,

} from "../domain/review/reviewImport";

import { MODULES } from "../data/modulesMeta";

import { useWorkspace } from "../hooks/useWorkspace";

import { buildChatGptReviewPrompt, buildExportJson } from "../lib/export";

import { formatDuration } from "../lib/formatTime";

import type { DiagnosticRun } from "../types/diagnostic";



interface FinalDashboardProps {

  run: DiagnosticRun;

  onBack: () => void;

}



export function FinalDashboard({ run, onBack }: FinalDashboardProps) {

  const { workspace, persist } = useWorkspace();

  const [copied, setCopied] = useState<"json" | "prompt" | "template" | null>(null);

  const [reviewRaw, setReviewRaw] = useState("");

  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [preview, setPreview] = useState<ReviewImportPreview | null>(null);

  const json = buildExportJson(run);

  const reviewTemplate = JSON.stringify(buildReviewTemplate(run.id), null, 2);

  const fullPrompt = useMemo(() => buildChatGptReviewPrompt(json), [json]);



  const copy = async (text: string, kind: "json" | "prompt" | "template") => {

    await navigator.clipboard.writeText(text);

    setCopied(kind);

    window.setTimeout(() => setCopied(null), 2000);

  };



  const download = () => {

    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `diagnostic-export-${run.id.slice(0, 8)}.json`;

    a.click();

    URL.revokeObjectURL(url);

  };



  const downloadTemplate = () => {

    const blob = new Blob([reviewTemplate], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `diagnostic-review-${run.id.slice(0, 8)}.json`;

    a.click();

    URL.revokeObjectURL(url);

  };



  const runPreview = () => {

    if (!workspace) return;

    setImportMessage(null);

    setPreview(previewReviewImport(workspace, reviewRaw, { expectedRunId: run.id }));

  };



  const confirmImport = async () => {

    if (!workspace) return;

    try {

      const result = importExternalReviewJson(workspace, reviewRaw, {

        moduleSelfConfidence: run.confidence,

        expectedRunId: run.id,

        diagnosticSeconds: run.totalElapsedSeconds ?? null,

      });

      await persist(result.workspace);

      setImportMessage(result.message);

      setPreview(result.preview);

    } catch (e) {

      setImportMessage(e instanceof Error ? e.message : "Import failed");

      setPreview(null);

    }

  };



  return (

    <div className="mx-auto max-w-2xl px-6 py-16">

      <p className="font-mono text-[10px] tracking-widest text-signal uppercase">Diagnostic complete</p>

      <h1 className="mt-2 text-3xl font-medium text-accent">

        {run.completedModuleIds.length} / {MODULES.length} modules

      </h1>

      <p className="mt-2 font-mono text-sm text-muted">{formatDuration(run.totalElapsedSeconds)} elapsed</p>

      <ul className="mt-8 space-y-2 border border-border rounded-md p-4">

        {MODULES.map((m) => (

          <li key={m.id} className="flex justify-between font-mono text-sm">

            <span className="text-muted">{m.title}</span>

            <span className="text-signal">{run.completedModuleIds.includes(m.id) ? "✓" : "—"}</span>

          </li>

        ))}

      </ul>

      <div className="mt-8 rounded-md border border-border bg-panel p-4">

        <p className="font-mono text-xs text-muted uppercase">Scoring</p>

        <p className="mt-2 text-lg text-accent">Awaiting external review</p>

        <p className="mt-1 text-xs text-muted">Export DiagnosticExportV1 JSON and paste into ChatGPT with the review prompt.</p>

      </div>

      <div className="mt-6 flex flex-wrap gap-3">

        <button

          type="button"

          onClick={download}

          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent"

        >

          Export Diagnostic (JSON)

        </button>

        <button

          type="button"

          onClick={() => copy(json, "json")}

          className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"

        >

          {copied === "json" ? "Copied" : "Copy JSON"}

        </button>

        <button

          type="button"

          onClick={() => copy(fullPrompt, "prompt")}

          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent"

        >

          {copied === "prompt" ? "Copied" : "Copy ChatGPT review prompt"}

        </button>

        <button

          type="button"

          onClick={downloadTemplate}

          className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"

        >

          Download review template

        </button>

        <button

          type="button"

          onClick={() => copy(reviewTemplate, "template")}

          className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"

        >

          {copied === "template" ? "Copied" : "Copy review template"}

        </button>

      </div>

      <div className="mt-8 rounded-md border border-border bg-panel p-4">

        <p className="font-mono text-xs uppercase text-muted">Import external review</p>

        <p className="mt-1 text-xs text-muted">

          Paste DiagnosticExternalReviewV1 JSON. Preview validates schema and idempotency before apply.

        </p>

        <textarea

          value={reviewRaw}

          onChange={(e) => {

            setReviewRaw(e.target.value);

            setPreview(null);

          }}

          rows={8}

          className="mt-3 w-full rounded border border-border bg-bg px-3 py-2 font-mono text-xs text-accent"

          placeholder='{"schemaVersion":1,"runId":"..."}'

        />

        <div className="mt-3 flex flex-wrap gap-2">

          <button

            type="button"

            onClick={runPreview}

            disabled={!reviewRaw.trim() || !workspace}

            className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent disabled:opacity-40"

          >

            Preview import

          </button>

          <button

            type="button"

            onClick={confirmImport}

            disabled={!reviewRaw.trim() || !workspace || (preview != null && preview.errors.length > 0)}

            className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent disabled:opacity-40"

          >

            Apply review

          </button>

        </div>

        {preview && (

          <div className="mt-4 rounded border border-border/80 bg-bg p-3 font-mono text-xs">

            {preview.errors.length > 0 ? (

              <p className="whitespace-pre-wrap text-red-400">{preview.errors.join("\n")}</p>

            ) : (

              <>

                <p className="text-muted">reviewId: {preview.reviewId}</p>

                <p className="text-muted">runId: {preview.runId}</p>

                <p className="mt-2 text-accent">

                  +{preview.evidenceToAdd} evidence · +{preview.weaknessesToAdd} weaknesses

                </p>

                {preview.alreadyApplied && (

                  <p className="mt-2 text-signal">Already imported — apply will skip duplicates.</p>

                )}

              </>

            )}

          </div>

        )}

        {importMessage && <p className="mt-2 text-xs text-muted">{importMessage}</p>}

        <Link to="/analytics" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">

          Open analytics →

        </Link>

        <Link to="/" className="mt-3 ml-4 inline-block font-mono text-xs text-accent hover:underline">

          Cockpit →

        </Link>

      </div>

      <button type="button" onClick={onBack} className="mt-8 text-xs text-muted hover:text-accent">

        ← Back to modules

      </button>

    </div>

  );

}

