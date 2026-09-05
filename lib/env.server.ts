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

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RATE_LIMIT_HASH_SECRET: z.string().min(16),
  NEXT_PUBLIC_SITE_URL: z.url(),
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

export type ServerEnv = z.infer<typeof serverEnvSchema>;

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

  cached = parsed.data;
  return cached;
}

export function resetServerEnvCacheForTests() {
  cached = undefined;
}
