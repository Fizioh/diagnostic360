import { browserJsBurstDetectorAdapter } from "./browserJsExecutionAdapter";
import type { ExecutionAdapter, ExecutionRequest, ExecutionResult } from "./types";

const adapters: ExecutionAdapter[] = [browserJsBurstDetectorAdapter];

export function resolveExecutionAdapter(request: ExecutionRequest): ExecutionAdapter | null {
  return adapters.find((a) => a.canExecute(request)) ?? null;
}

export async function runExecution(request: ExecutionRequest): Promise<ExecutionResult> {
  const adapter = resolveExecutionAdapter(request);
  if (!adapter) {
    return {
      ok: false,
      stdout: "",
      stderr: "",
      tests: [],
      unsupportedReason: `No execution adapter for profile ${request.profileId}`,
      durationMs: 0,
    };
  }
  return adapter.execute(request);
}

export type { ExecutionResult, ExecutionRequest };
