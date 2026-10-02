import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { verifyPassphrase } from "./crypto";
import { getPlanningSnapshot } from "./planningSnapshot";
import { isLoginBlocked, recordLoginFailure, resetLoginFailures } from "./rateLimit";

type Env = {
  SESSION_SECRET: string;
  PASSPHRASE_SALT: string;
  PASSPHRASE_HASH: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_KV?: KVNamespace;
};

type SessionPayload = { sub: "mission2027-user" };

const SESSION_COOKIE = "m2027_session";
const SESSION_TTL_SEC = 60 * 60 * 4;
const MAX_LOGIN_BODY_BYTES = 4096;
const MAX_PASSPHRASE_LENGTH = 256;

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
    await jwtVerify(token, key, { algorithms: ["HS256"] });
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
  const kv = c.env.RATE_LIMIT_KV;
  if (await isLoginBlocked(kv, ip)) {
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  }
  const contentLength = c.req.header("content-length");
  if (contentLength && Number(contentLength) > MAX_LOGIN_BODY_BYTES) {
    return c.json({ error: "Payload too large" }, 413);
  }
  if (!c.env.SESSION_SECRET || !c.env.PASSPHRASE_SALT || !c.env.PASSPHRASE_HASH) {
    return c.json({ error: "Auth not configured" }, 503);
  }
  const rawBody = await c.req.text();
  if (rawBody.length > MAX_LOGIN_BODY_BYTES) {
    return c.json({ error: "Payload too large" }, 413);
  }
  let body: { passphrase?: string };
  try {
    body = JSON.parse(rawBody) as { passphrase?: string };
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const passphrase = body.passphrase ?? "";
  if (passphrase.length > MAX_PASSPHRASE_LENGTH) {
    return c.json({ error: "Invalid access key" }, 401);
  }
  const valid = await verifyPassphrase(passphrase, c.env.PASSPHRASE_SALT, c.env.PASSPHRASE_HASH);
  if (!valid) {
    await recordLoginFailure(kv, ip);
    return c.json({ error: "Invalid access key" }, 401);
  }
  await resetLoginFailures(kv, ip);
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
