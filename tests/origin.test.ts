import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerEnv: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  getServerEnv: mocks.getServerEnv,
}));

import { isAllowedRequestOrigin } from "@/lib/security/request-origin.server";

describe("request origin validation", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("allows any origin outside production", () => {
    mocks.getServerEnv.mockReturnValue({
      NODE_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "https://waitlist.example.test",
    });
    const headers = new Headers({ origin: "http://localhost:43123" });
    expect(isAllowedRequestOrigin(headers)).toBe(true);
  });

  it("rejects a foreign origin in production", () => {
    mocks.getServerEnv.mockReturnValue({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://waitlist.example.test",
    });
    const headers = new Headers({ origin: "https://evil.example" });
    expect(isAllowedRequestOrigin(headers)).toBe(false);
  });

  it("allows the configured site origin in production", () => {
    mocks.getServerEnv.mockReturnValue({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://waitlist.example.test",
    });
    const headers = new Headers({ origin: "https://waitlist.example.test" });
    expect(isAllowedRequestOrigin(headers)).toBe(true);
  });
});
