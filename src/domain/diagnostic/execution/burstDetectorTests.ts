export interface BurstEvent {
  userId: string;
  timestamp: number;
}

export type DetectBurstsFn = (
  events: BurstEvent[],
  windowSeconds: number,
  threshold: number,
) => string[];

export const BURST_DETECTOR_TEST_IDS = ["empty", "below-threshold", "sliding-window", "multi-user"] as const;

export function runBurstDetectorTests(fn: DetectBurstsFn): { id: string; name: string; passed: boolean; message?: string }[] {
  const results: { id: string; name: string; passed: boolean; message?: string }[] = [];

  const assert = (id: string, name: string, actual: string[], expected: string[]) => {
    const sorted = [...actual].sort();
    const exp = [...expected].sort();
    const passed = JSON.stringify(sorted) === JSON.stringify(exp);
    results.push({
      id,
      name,
      passed,
      message: passed ? undefined : `expected ${JSON.stringify(exp)}, got ${JSON.stringify(sorted)}`,
    });
  };

  assert("empty", "empty events", fn([], 60, 2), []);
  assert(
    "below-threshold",
    "single event below threshold",
    fn([{ userId: "a", timestamp: 1 }], 60, 2),
    [],
  );
  assert(
    "sliding-window",
    "burst within sliding window",
    fn(
      [
        { userId: "a", timestamp: 0 },
        { userId: "a", timestamp: 10 },
        { userId: "a", timestamp: 20 },
      ],
      30,
      2,
    ),
    ["a"],
  );
  assert(
    "multi-user",
    "only offending users",
    fn(
      [
        { userId: "a", timestamp: 0 },
        { userId: "a", timestamp: 5 },
        { userId: "b", timestamp: 0 },
      ],
      10,
      2,
    ),
    ["a"],
  );

  return results;
}
