import { describe, expect, it } from "vitest";
import { InMemoryWaitlist } from "./helpers/in-memory-waitlist";

describe("atomic Founding 100 assignment", () => {
  it("assigns founding membership through positions 99, 100, and 101 under concurrency", async () => {
    const waitlist = new InMemoryWaitlist(98);
    const results = await Promise.all(
      [99, 100, 101].map((n) =>
        waitlist.join({
          email: `petparent${n}@example.com`,
          fullName: `Parent ${n}`,
          petType: "cat",
        }),
      ),
    );

    const ordered = [...results].sort((a, b) => a.waitlistPosition - b.waitlistPosition);
    expect(ordered.map((row) => row.waitlistPosition)).toEqual([99, 100, 101]);
    expect(ordered[0]?.foundingMember).toBe(true);
    expect(ordered[1]?.foundingMember).toBe(true);
    expect(ordered[2]?.foundingMember).toBe(false);
    expect(waitlist.size).toBe(101);
  });

  it("is idempotent for duplicate concurrent emails", async () => {
    const waitlist = new InMemoryWaitlist(0);
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        waitlist.join({
          email: "Same.Person@example.com",
          fullName: "Same Person",
          petType: "bird",
        }),
      ),
    );

    const joined = results.filter((row) => row.outcome === "joined");
    const already = results.filter((row) => row.outcome === "already_joined");
    expect(joined).toHaveLength(1);
    expect(already).toHaveLength(7);
    expect(waitlist.size).toBe(1);
    expect(joined[0]?.foundingMember).toBe(true);
  });
});
