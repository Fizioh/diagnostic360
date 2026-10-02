const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

type Bucket = { failures: number; windowStart: number };

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  isBlocked(ip: string): boolean {
    const b = this.buckets.get(ip);
    if (!b) return false;
    if (Date.now() - b.windowStart > WINDOW_MS) {
      this.buckets.delete(ip);
      return false;
    }
    return b.failures >= MAX_FAILURES;
  }

  recordFailure(ip: string): void {
    const now = Date.now();
    const b = this.buckets.get(ip);
    if (!b || now - b.windowStart > WINDOW_MS) {
      this.buckets.set(ip, { failures: 1, windowStart: now });
      return;
    }
    b.failures += 1;
  }

  reset(ip: string): void {
    this.buckets.delete(ip);
  }
}
