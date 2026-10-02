import { MODULE_ORDER, type DiagnosticRun } from "../../types/diagnostic";

export interface DiagnosticProgressSummary {
  started: boolean;
  status: DiagnosticRun["status"] | "not-started";
  completedCount: number;
  totalModules: number;
  currentModuleId: DiagnosticRun["currentModuleId"] | null;
  label: string;
}

export function summarizeDiagnosticRun(run: DiagnosticRun | null): DiagnosticProgressSummary {
  const totalModules = MODULE_ORDER.length;
  if (!run) {
    return {
      started: false,
      status: "not-started",
      completedCount: 0,
      totalModules,
      currentModuleId: null,
      label: "Not started",
    };
  }
  const completedCount = run.completedModuleIds.length;
  const label =
    run.status === "complete"
      ? `Complete (${completedCount}/${totalModules} modules)`
      : `${completedCount}/${totalModules} modules · ${run.status}`;
  return {
    started: true,
    status: run.status,
    completedCount,
    totalModules,
    currentModuleId: run.currentModuleId,
    label,
  };
}
