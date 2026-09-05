import "server-only";

import { z } from "zod";

function blankToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function coerceHttpUrl(value: unknown) {
  const trimmed = blankToUndefined(value);
  if (typeof trimmed !== "string") {
    return undefined;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    try {
      return new URL(`https://${trimmed}`).origin;
    } catch {
      return undefined;
    }
  }
}

function optionalFlag(value: unknown) {
  const trimmed = blankToUndefined(value);
  if (trimmed === "true" || trimmed === "false") {
    return trimmed;
  }
  return undefined;
}

const optionalUrl = z.preprocess(coerceHttpUrl, z.url().optional());

const optionalString = z.preprocess(
  blankToUndefined,
  z.string().min(1).optional(),
);

const optionalSiteUrl = z.preprocess(coerceHttpUrl, z.url().optional());

const optionalTrueFalse = z.preprocess(optionalFlag, z.enum(["true", "false"]).optional());

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(coerceHttpUrl, z.url()),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(blankToUndefined, z.string().min(20)),
  TURNSTILE_SECRET_KEY: z.preprocess(blankToUndefined, z.string().min(1)),
  RATE_LIMIT_HASH_SECRET: z.preprocess((value) => {
    const trimmed = blankToUndefined(value);
    if (typeof trimmed !== "string" || trimmed.length < 16) {
      return undefined;
    }
    return trimmed;
  }, z.string().min(16).optional()),
  NEXT_PUBLIC_SITE_URL: optionalSiteUrl,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  ANIMIVO_CONTACT_EMAIL: z.preprocess((value) => {
    const trimmed = blankToUndefined(value);
    if (typeof trimmed !== "string") {
      return undefined;
    }
    const parsed = z.email().safeParse(trimmed);
    return parsed.success ? parsed.data : undefined;
  }, z.email().optional()),
  ALLOW_DEV_TURNSTILE_BYPASS: optionalTrueFalse,
  NEXT_PUBLIC_ENABLE_ANALYTICS: optionalTrueFalse,
  NODE_ENV: z.preprocess((value) => {
    const trimmed = blankToUndefined(value);
    if (trimmed === "development" || trimmed === "test" || trimmed === "production") {
      return trimmed;
    }
    return undefined;
  }, z.enum(["development", "test", "production"]).optional()),
  VERCEL: optionalString,
  VERCEL_ENV: optionalString,
  VERCEL_URL: optionalString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  RATE_LIMIT_HASH_SECRET: string;
};

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const keys = [
      ...new Set(
        parsed.error.issues
          .map((issue) => String(issue.path[0] ?? "unknown"))
          .filter(Boolean),
      ),
    ].sort();
    console.error(`[waitlist] env_unconfigured keys=${keys.join(",")}`);
    throw new Error("Server configuration error");
  }

  const rateLimitSecret =
    parsed.data.RATE_LIMIT_HASH_SECRET ??
    `animivo-waitlist:${parsed.data.SUPABASE_SERVICE_ROLE_KEY.slice(0, 48)}`;

  cached = {
    ...parsed.data,
    RATE_LIMIT_HASH_SECRET: rateLimitSecret,
  };
  return cached;
}

export function resetServerEnvCacheForTests() {
  cached = undefined;
}
