import type { DetectBurstsFn } from "./burstDetectorTests";
import { runBurstDetectorTests } from "./burstDetectorTests";
import type { ExecutionAdapter, ExecutionRequest, ExecutionResult } from "./types";

function extractDetectBursts(source: string): DetectBurstsFn {
  const trimmed = source.trim();
  const body = `
    ${trimmed}
    if (typeof detectBursts !== "function") {
      throw new Error("Define function detectBursts(events, windowSeconds, threshold)");
    }
    return detectBursts;
  `;
  const factory = new Function(body) as () => DetectBurstsFn;
  return factory();
}

export const browserJsBurstDetectorAdapter: ExecutionAdapter = {
  id: "browser-js-burst-detector",
  canExecute(request: ExecutionRequest) {
    return request.profileId === "browser-js-burst-detector";
  },
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const started = performance.now();
    const stdout: string[] = [];
    const stderr: string[] = [];

    if (request.language === "python") {
      return {
        ok: false,
        stdout: "",
        stderr: "",
        tests: [],
        unsupportedReason: "Python execution is not available in Phase 1 (browser-safe JS/TS only).",
        durationMs: Math.round(performance.now() - started),
      };
    }

    try {
      const fn = extractDetectBursts(request.source);
      stdout.push("Loaded detectBursts successfully.");
      const tests = runBurstDetectorTests(fn);
      const ok = tests.every((t) => t.passed);
      return {
        ok,
        stdout: stdout.join("\n"),
        stderr: stderr.join("\n"),
        tests,
        durationMs: Math.round(performance.now() - started),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      stderr.push(message);
      return {
        ok: false,
        stdout: stdout.join("\n"),
        stderr: stderr.join("\n"),
        tests: [],
        durationMs: Math.round(performance.now() - started),
      };
    }
  },
};
