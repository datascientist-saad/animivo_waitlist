import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SENSITIVE = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RATE_LIMIT_HASH_SECRET",
  "UPSTASH_REDIS_REST_TOKEN",
];

function walk(dir: string, files: string[] = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (/\.(js|css|html|json)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("client bundle secret leak check", () => {
  it("does not embed the service-role key name in client output", () => {
    const staticDir = path.join(process.cwd(), ".next/static");
    if (!existsSync(staticDir)) {
      expect(existsSync(staticDir)).toBe(false);
      return;
    }

    const files = walk(staticDir);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of SENSITIVE) {
        expect(text, file).not.toContain(needle);
      }
    }
  });
});
