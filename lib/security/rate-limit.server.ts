import "server-only";

import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/lib/env.server";
import { consumeSupabaseRateLimit } from "@/lib/supabase/admin.server";

/**
 * Hosting assumption: this app is deployed on Vercel.
 * `x-forwarded-for` is trusted only when `VERCEL=1`.
 * Outside Vercel production, forwarded IPs are treated as untrusted.
 */
export function getClientIp(headers: Headers): { ip: string | null; trusted: boolean } {
  const env = getServerEnv();
  const isVercel = env.VERCEL === "1";

  if (isVercel) {
    const forwarded = headers.get("x-forwarded-for");
    const candidate = forwarded?.split(",")[0]?.trim();
    if (candidate) {
      return { ip: candidate, trusted: true };
    }
    const realIp = headers.get("x-real-ip")?.trim();
    if (realIp) {
      return { ip: realIp, trusted: true };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return { ip: forwarded || "127.0.0.1", trusted: false };
  }

  return { ip: null, trusted: false };
}

export function hashRateLimitValue(value: string) {
  const env = getServerEnv();
  return createHmac("sha256", env.RATE_LIMIT_HASH_SECRET)
    .update(value)
    .digest("hex");
}

function getUpstash() {
  const env = getServerEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function consumeLimit(input: {
  key: string;
  windowSeconds: number;
  maxAttempts: number;
}) {
  const redis = getUpstash();
  if (redis) {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(input.maxAttempts, `${input.windowSeconds} s`),
      prefix: "animivo-waitlist",
    });
    const result = await limiter.limit(input.key);
    return result.success;
  }

  return consumeSupabaseRateLimit({
    bucketHash: input.key,
    windowSeconds: input.windowSeconds,
    maxAttempts: input.maxAttempts,
  });
}

export async function enforceWaitlistRateLimits(input: {
  ip: string | null;
  emailNormalized: string;
}) {
  const ipKey = hashRateLimitValue(`ip:${input.ip ?? "untrusted-client"}`);
  const emailKey = hashRateLimitValue(`email:${input.emailNormalized}`);

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeLimit({
      key: `ip:${ipKey}`,
      windowSeconds: 10 * 60,
      maxAttempts: 5,
    }),
    consumeLimit({
      key: `email:${emailKey}`,
      windowSeconds: 60 * 60,
      maxAttempts: 3,
    }),
  ]);

  return ipAllowed && emailAllowed;
}
