import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { verifyPassphrase } from "./crypto";
import { getPlanningSnapshot } from "./planningSnapshot";
import { RateLimiter } from "./rateLimit";

type Env = {
  SESSION_SECRET: string;
  PASSPHRASE_SALT: string;
  PASSPHRASE_HASH: string;
  ALLOWED_ORIGINS: string;
};

type SessionPayload = { sub: "mission2027-user" };

const SESSION_COOKIE = "m2027_session";
const SESSION_TTL_SEC = 60 * 60 * 4;
const limiter = new RateLimiter();

const app = new Hono<{ Bindings: Env }>();

function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
}

function clientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";
}

async function signSession(secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ sub: "mission2027-user" satisfies SessionPayload["sub"] })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(key);
}

async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

app.use("*", async (c, next) => {
  const origins = allowedOrigins(c.env);
  return cors({
    origin: (origin) => (origin && origins.includes(origin) ? origin : origins[0] ?? ""),
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })(c, next);
});

app.get("/health", (c) => c.json({ ok: true }));

app.get("/auth/session", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token || !c.env.SESSION_SECRET) {
    return c.json({ authenticated: false }, 401);
  }
  const ok = await verifySessionToken(token, c.env.SESSION_SECRET);
  if (!ok) return c.json({ authenticated: false }, 401);
  return c.json({ authenticated: true, expiresInSec: SESSION_TTL_SEC });
});

app.post("/auth/login", async (c) => {
  const ip = clientIp(c);
  if (limiter.isBlocked(ip)) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }
  if (!c.env.SESSION_SECRET || !c.env.PASSPHRASE_SALT || !c.env.PASSPHRASE_HASH) {
    return c.json({ error: "Auth not configured" }, 503);
  }
  const body = await c.req.json<{ passphrase?: string }>().catch(() => ({}));
  const passphrase = body.passphrase ?? "";
  const valid = await verifyPassphrase(passphrase, c.env.PASSPHRASE_SALT, c.env.PASSPHRASE_HASH);
  if (!valid) {
    limiter.recordFailure(ip);
    return c.json({ error: "Invalid access key" }, 401);
  }
  limiter.reset(ip);
  const token = await signSession(c.env.SESSION_SECRET);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  return c.json({ authenticated: true, expiresInSec: SESSION_TTL_SEC });
});

app.post("/auth/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/", secure: true, sameSite: "None" });
  return c.json({ ok: true });
});

app.get("/api/planning", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token || !c.env.SESSION_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const ok = await verifySessionToken(token, c.env.SESSION_SECRET);
  if (!ok) return c.json({ error: "Unauthorized" }, 401);
  return c.json(getPlanningSnapshot());
});

export default app;
