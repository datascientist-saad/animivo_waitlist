import "server-only";

import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.url().optional());

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalSiteUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.url().optional());

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(20),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().trim().min(1),
  TURNSTILE_SECRET_KEY: z.string().trim().min(1),
  RATE_LIMIT_HASH_SECRET: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(16).optional(),
  ),
  NEXT_PUBLIC_SITE_URL: optionalSiteUrl,
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  ANIMIVO_CONTACT_EMAIL: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.email().optional()),
  ALLOW_DEV_TURNSTILE_BYPASS: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(["true", "false"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
  VERCEL_URL: z.string().optional(),
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
    console.error(
      "Server environment validation failed. Check required variable names in .env.example.",
    );
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
