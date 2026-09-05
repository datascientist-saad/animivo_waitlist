import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getServerEnv, resetServerEnvCacheForTests } from "@/lib/env.server";

const required = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key-value-20",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
};

describe("getServerEnv", () => {
  afterEach(() => {
    resetServerEnvCacheForTests();
    vi.unstubAllEnvs();
  });

  it("accepts production with only required secrets", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", required.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", required.SUPABASE_SERVICE_ROLE_KEY);
    vi.stubEnv("TURNSTILE_SECRET_KEY", required.TURNSTILE_SECRET_KEY);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");

    const env = getServerEnv();
    expect(env.TURNSTILE_SECRET_KEY).toBe("turnstile-secret");
    expect(env.RATE_LIMIT_HASH_SECRET.length).toBeGreaterThan(16);
  });

  it("does not fail when optional flags and SITE_URL are messy", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", required.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", required.SUPABASE_SERVICE_ROLE_KEY);
    vi.stubEnv("TURNSTILE_SECRET_KEY", required.TURNSTILE_SECRET_KEY);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "animivo-waitlist.vercel.app");
    vi.stubEnv("RATE_LIMIT_HASH_SECRET", "short");
    vi.stubEnv("ALLOW_DEV_TURNSTILE_BYPASS", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "yes");
    vi.stubEnv("ANIMIVO_CONTACT_EMAIL", "not-an-email");
    vi.stubEnv("NODE_ENV", "production");

    const env = getServerEnv();
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://animivo-waitlist.vercel.app");
    expect(env.ALLOW_DEV_TURNSTILE_BYPASS).toBeUndefined();
    expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBeUndefined();
    expect(env.ANIMIVO_CONTACT_EMAIL).toBeUndefined();
    expect(env.RATE_LIMIT_HASH_SECRET.startsWith("animivo-waitlist:")).toBe(true);
  });

  it("throws when the service-role key is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", required.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv("TURNSTILE_SECRET_KEY", required.TURNSTILE_SECRET_KEY);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => getServerEnv()).toThrow("Server configuration error");
  });
});
