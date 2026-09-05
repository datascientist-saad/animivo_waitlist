import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerEnv: vi.fn(),
  enforceWaitlistRateLimits: vi.fn(),
  getClientIp: vi.fn(),
  isAllowedRequestOrigin: vi.fn(),
  verifyTurnstileToken: vi.fn(),
  joinWaitlist: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  getServerEnv: mocks.getServerEnv,
}));

vi.mock("@/lib/security/rate-limit.server", () => ({
  enforceWaitlistRateLimits: mocks.enforceWaitlistRateLimits,
  getClientIp: mocks.getClientIp,
}));

vi.mock("@/lib/security/request-origin.server", () => ({
  isAllowedRequestOrigin: mocks.isAllowedRequestOrigin,
}));

vi.mock("@/lib/security/turnstile.server", () => ({
  verifyTurnstileToken: mocks.verifyTurnstileToken,
}));

vi.mock("@/lib/supabase/admin.server", () => ({
  joinWaitlist: mocks.joinWaitlist,
}));

import { POST } from "@/app/api/waitlist/route";
import {
  GENERIC_ERROR,
  RATE_LIMIT_ERROR,
  SETUP_ERROR,
  VERIFY_ERROR,
} from "@/lib/validation/waitlist";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Alex Rivera",
    email: "alex@example.com",
    petType: "dog",
    petName: "Luna",
    biggestChallenge: "Remembering vaccine dates",
    consent: true,
    website: "",
    turnstileToken: "turnstile-token",
    utmSource: "reddit",
    utmMedium: "community",
    utmCampaign: "founding100",
    utmContent: "post-1",
    referralSource: "petowners",
    landingPath: "/",
    referringDomain: "www.reddit.com",
    ...overrides,
  };
}

async function postJson(body: unknown, init?: { headers?: Record<string, string> }) {
  return POST(
    new Request("http://127.0.0.1:43123/api/waitlist", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://waitlist.example.test",
        ...init?.headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    mocks.getServerEnv.mockReturnValue({});
    mocks.isAllowedRequestOrigin.mockReturnValue(true);
    mocks.getClientIp.mockReturnValue({ ip: "203.0.113.10", trusted: true });
    mocks.enforceWaitlistRateLimits.mockResolvedValue(true);
    mocks.verifyTurnstileToken.mockResolvedValue({ ok: true });
    mocks.joinWaitlist.mockResolvedValue({ outcome: "joined", founding_member: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a valid signup", async () => {
    const response = await postJson(validBody());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, outcome: "joined" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.joinWaitlist).toHaveBeenCalledOnce();
  });

  it("rejects an invalid email", async () => {
    const response = await postJson(validBody({ email: "not-an-email" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: GENERIC_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("rejects missing consent", async () => {
    const response = await postJson(validBody({ consent: false }));
    expect(response.status).toBe(400);
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("rejects an unsupported pet type", async () => {
    const response = await postJson(validBody({ petType: "dragon" }));
    expect(response.status).toBe(400);
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("rejects overlong values", async () => {
    const response = await postJson(validBody({ fullName: "A".repeat(81) }));
    expect(response.status).toBe(400);
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("returns a generic success for honeypot submissions", async () => {
    const response = await postJson(validBody({ website: "https://spam.test" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, outcome: "joined" });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
    expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
  });

  it("rejects an invalid Turnstile token", async () => {
    mocks.verifyTurnstileToken.mockResolvedValue({ ok: false, reason: "rejected" });
    const response = await postJson(validBody());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: VERIFY_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("rate-limits with a generic retry message", async () => {
    mocks.enforceWaitlistRateLimits.mockResolvedValue(false);
    const response = await postJson(validBody());
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ ok: false, error: RATE_LIMIT_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("returns the duplicate-email success payload without database details", async () => {
    mocks.joinWaitlist.mockResolvedValue({
      outcome: "already_joined",
      founding_member: true,
    });
    const response = await postJson(validBody());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, outcome: "already_joined" });
  });

  it("rejects disallowed origins", async () => {
    mocks.isAllowedRequestOrigin.mockReturnValue(false);
    const response = await postJson(validBody());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: GENERIC_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("returns a generic error when Supabase fails", async () => {
    mocks.joinWaitlist.mockRejectedValue(new Error("permission denied for table waitlist_signups"));
    const response = await postJson(validBody());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ ok: false, error: GENERIC_ERROR });
    expect(JSON.stringify(body)).not.toContain("permission denied");
  });

  it("returns a setup error when required env is missing", async () => {
    mocks.getServerEnv.mockImplementation(() => {
      throw new Error("Server configuration error");
    });
    const response = await postJson(validBody());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: SETUP_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("returns a setup error when the rate-limit backend fails", async () => {
    mocks.enforceWaitlistRateLimits.mockRejectedValue(new Error("RATE_LIMIT_BACKEND_FAILED"));
    const response = await postJson(validBody());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: SETUP_ERROR });
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });

  it("stores XSS-like strings without reflecting them in the response", async () => {
    const xss = '<script>alert("xss")</script>';
    const response = await postJson(
      validBody({
        fullName: "Sam Example",
        petName: xss,
        biggestChallenge: xss,
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("<script>");
    expect(mocks.joinWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({
        petName: xss,
        biggestChallenge: xss,
      }),
    );
  });

  it("rejects non-JSON content types", async () => {
    const response = await POST(
      new Request("http://127.0.0.1:43123/api/waitlist", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "hello",
      }),
    );
    expect(response.status).toBe(415);
  });

  it("rejects unknown properties", async () => {
    const response = await postJson({ ...validBody(), extra: "nope" });
    expect(response.status).toBe(400);
    expect(mocks.joinWaitlist).not.toHaveBeenCalled();
  });
});
