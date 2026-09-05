import { describe, expect, it } from "vitest";
import { COPY } from "@/lib/site-config";

describe("safe rendering of user-supplied strings", () => {
  it("does not interpolate untrusted markup into success copy", () => {
    expect(COPY.successTitle).not.toContain("<");
    expect(COPY.successBody).not.toContain("<script");
    expect(COPY.duplicate).not.toContain("<");
  });
});
