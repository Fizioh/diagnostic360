const WINDOW_SEC = 15 * 60;
const MAX_FAILURES = 8;

type Bucket = { failures: number; windowStart: number };

function cacheKey(ip: string): Request {
  return new Request(`https://rate-limit.mission2027.internal/${encodeURIComponent(ip)}`);
}

async function readBucket(kv: KVNamespace | undefined, ip: string): Promise<Bucket | null> {
  if (kv) {
    const raw = await kv.get(`login_fail:${ip}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Bucket;
    } catch {
      return null;
    }
  }
  const cache = caches.default;
  const res = await cache.match(cacheKey(ip));
  if (!res) return null;
  try {
    return (await res.json()) as Bucket;
  } catch {
    return null;
  }
}

async function writeBucket(kv: KVNamespace | undefined, ip: string, bucket: Bucket): Promise<void> {
  if (kv) {
    await kv.put(`login_fail:${ip}`, JSON.stringify(bucket), { expirationTtl: WINDOW_SEC });
    return;
  }
  const cache = caches.default;
  await cache.put(
    cacheKey(ip),
    new Response(JSON.stringify(bucket), {
      headers: { "Cache-Control": `max-age=${WINDOW_SEC}` },
    }),
  );
}

async function clearBucket(kv: KVNamespace | undefined, ip: string): Promise<void> {
  if (kv) {
    await kv.delete(`login_fail:${ip}`);
    return;
  }
  const cache = caches.default;
  await cache.delete(cacheKey(ip));
}

function bucketBlocked(bucket: Bucket | null): boolean {
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > WINDOW_SEC * 1000) return false;
  return bucket.failures >= MAX_FAILURES;
}

export async function isLoginBlocked(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  const bucket = await readBucket(kv, ip);
  return bucketBlocked(bucket);
}

export async function recordLoginFailure(kv: KVNamespace | undefined, ip: string): Promise<void> {
  const now = Date.now();
  const existing = await readBucket(kv, ip);
  const bucket: Bucket =
    !existing || now - existing.windowStart > WINDOW_SEC * 1000
      ? { failures: 1, windowStart: now }
      : { failures: existing.failures + 1, windowStart: existing.windowStart };
  await writeBucket(kv, ip, bucket);
}

export async function resetLoginFailures(kv: KVNamespace | undefined, ip: string): Promise<void> {
  await clearBucket(kv, ip);
}
