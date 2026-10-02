import { useState } from "react";
import { Link } from "react-router-dom";
import {
  applyExternalReview,
  buildReviewTemplate,
  parseExternalReviewJson,
} from "../domain/diagnostic/externalReview";
import { MODULES } from "../data/modulesMeta";
import { useWorkspace } from "../hooks/useWorkspace";
import { buildExportJson, REVIEW_PROMPT } from "../lib/export";
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
  const json = buildExportJson(run);
  const reviewTemplate = JSON.stringify(buildReviewTemplate(run.id), null, 2);

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
    a.download = `senior-mission-2027-${run.id.slice(0, 8)}.json`;
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

  const importReview = async () => {
    if (!workspace) return;
    try {
      const review = parseExternalReviewJson(reviewRaw);
      if (review.runId !== run.id) {
        setImportMessage("runId does not match this diagnostic session");
        return;
      }
      await persist(applyExternalReview(workspace, review));
      setImportMessage("Review imported — evidence and weaknesses updated in workspace.");
    } catch (e) {
      setImportMessage(e instanceof Error ? e.message : "Import failed");
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
        <p className="mt-1 text-xs text-muted">Export JSON and paste into ChatGPT with the review prompt.</p>
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
          onClick={() => copy(`${REVIEW_PROMPT}\n\n---\n\n${json}`, "prompt")}
          className="rounded-md border border-border px-4 py-2 font-mono text-sm text-muted hover:text-accent"
        >
          {copied === "prompt" ? "Copied" : "Copy review prompt"}
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
          Paste DiagnosticExternalReviewV1 JSON after human/LLM review. No automatic scoring.
        </p>
        <textarea
          value={reviewRaw}
          onChange={(e) => setReviewRaw(e.target.value)}
          rows={8}
          className="mt-3 w-full rounded border border-border bg-bg px-3 py-2 font-mono text-xs text-accent"
          placeholder='{"schemaVersion":1,"runId":"..."}'
        />
        <button
          type="button"
          onClick={importReview}
          disabled={!reviewRaw.trim() || !workspace}
          className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent disabled:opacity-40"
        >
          Import review into workspace
        </button>
        {importMessage && <p className="mt-2 text-xs text-muted">{importMessage}</p>}
        <Link to="/" className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
          Open dashboard →
        </Link>
      </div>
      <button type="button" onClick={onBack} className="mt-8 text-xs text-muted hover:text-accent">
        ← Back to modules
      </button>
    </div>
  );
}
