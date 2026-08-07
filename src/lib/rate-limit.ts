import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

/**
 * Distributed rate limiting built on Upstash Redis (serverless-friendly).
 *
 * On Vercel each request may land on a fresh serverless instance, so an
 * in-memory Map is not shared across instances and is effectively decorative
 * in production. We therefore prefer Upstash Redis whenever the env vars are
 * configured, and fall back to the in-memory Map (single-node dev only).
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_UPSTASH = Boolean(redisUrl && redisToken);

const redis = USE_UPSTASH
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : null;

// One limiter per (limit, windowMs) pair, cached so we don't recreate it
// on every call.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number) {
  const key = `${limit}:${windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter && redis) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    });
    limiters.set(key, limiter);
  }
  return limiter || null;
}

// ── In-memory fallback (dev / no Upstash configured) ──────────────────────
const buckets = new Map<string, Bucket>();

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    ok: true,
    remaining: limit - current.count,
    retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export async function rateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): Promise<{ ok: boolean; remaining: number; retryAfterSec: number }> {
  if (!USE_UPSTASH || !redis) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  const limiter = getLimiter(limit, windowMs);
  if (!limiter) {
    return inMemoryRateLimit(key, limit, windowMs);
  }

  try {
    const result = await limiter.limit(key);
    return {
      ok: result.success,
      remaining: result.remaining,
      retryAfterSec: Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000)
      ),
    };
  } catch (error) {
    // If Redis is unreachable, fail open in dev / degrade gracefully rather
    // than blocking the whole store.
    console.error("Upstash rate limit error, falling back to in-memory:", error);
    return inMemoryRateLimit(key, limit, windowMs);
  }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

