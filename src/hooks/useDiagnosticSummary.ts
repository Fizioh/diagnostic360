import { useEffect, useState } from "react";
import { summarizeDiagnosticRun, type DiagnosticProgressSummary } from "../domain/diagnostic/summarizeRun";
import { loadRun } from "../lib/storage";

export function useDiagnosticSummary() {
  const [summary, setSummary] = useState<DiagnosticProgressSummary>(() =>
    summarizeDiagnosticRun(loadRun()),
  );

  useEffect(() => {
    const refresh = () => setSummary(summarizeDiagnosticRun(loadRun()));
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  return summary;
}
