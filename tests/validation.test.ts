import { describe, expect, it } from "vitest";
import {
  captureClientAttribution,
  extractReferringDomain,
  sanitizeLandingPath,
} from "@/lib/attribution";
import { waitlistRequestSchema } from "@/lib/validation/waitlist";

describe("waitlist validation", () => {
  const base = {
    fullName: "Jordan Lee",
    email: "jordan@example.com",
    petType: "bird",
    consent: true,
    turnstileToken: "token",
  };

  it("normalizes email by trimming", () => {
    const parsed = waitlistRequestSchema.parse({
      ...base,
      email: "  jordan@example.com ",
    });
    expect(parsed.email).toBe("jordan@example.com");
  });

  it("rejects missing consent", () => {
    const parsed = waitlistRequestSchema.safeParse({ ...base, consent: false });
    expect(parsed.success).toBe(false);
  });

  it("rejects unsupported pet types", () => {
    const parsed = waitlistRequestSchema.safeParse({ ...base, petType: "ferret" });
    expect(parsed.success).toBe(false);
  });
});

describe("attribution sanitization", () => {
  it("keeps only the referring hostname", () => {
    expect(
      extractReferringDomain("https://www.reddit.com/r/pets/?utm_source=evil&email=me@x.com"),
    ).toBe("www.reddit.com");
  });

  it("strips query strings from landing paths", () => {
    expect(sanitizeLandingPath("/join?utm_source=reddit#form")).toBe("/join");
  });

  it("captures campaign parameters from a Reddit-style URL", () => {
    const result = captureClientAttribution({
      search: "?utm_source=reddit&utm_medium=community&utm_campaign=founding100&ref=birdowners",
      pathname: "/",
      referrer: "https://old.reddit.com/r/parrots/comments/abc",
    });
    expect(result).toMatchObject({
      utmSource: "reddit",
      utmMedium: "community",
      utmCampaign: "founding100",
      referralSource: "birdowners",
      landingPath: "/",
      referringDomain: "old.reddit.com",
    });
  });
});
