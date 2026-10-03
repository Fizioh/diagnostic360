import { describe, expect, it } from "vitest";
import { browserJsBurstDetectorAdapter } from "./browserJsExecutionAdapter";

const reference = `function detectBursts(events, windowSeconds, threshold) {
  const counts = new Map();
  const active = new Map();
  const offenders = new Set();
  for (const ev of events) {
    const uid = ev.userId;
    const ts = ev.timestamp;
    if (!active.has(uid)) active.set(uid, []);
    const list = active.get(uid);
    list.push(ts);
    while (list.length && list[0] < ts - windowSeconds) list.shift();
    if (list.length >= threshold) offenders.add(uid);
  }
  return [...offenders];
}`;

describe("browserJsBurstDetectorAdapter", () => {
  it("runs bundled tests against valid implementation", async () => {
    const result = await browserJsBurstDetectorAdapter.execute({
      profileId: "browser-js-burst-detector",
      language: "typescript",
      source: reference,
    });
    expect(result.tests.length).toBeGreaterThan(0);
    expect(result.ok).toBe(true);
  });

  it("reports python as unsupported in phase 1", async () => {
    const result = await browserJsBurstDetectorAdapter.execute({
      profileId: "browser-js-burst-detector",
      language: "python",
      source: "def detectBursts(): pass",
    });
    expect(result.unsupportedReason).toBeTruthy();
  });
});
