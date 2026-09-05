#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const needles = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RATE_LIMIT_HASH_SECRET",
  "UPSTASH_REDIS_REST_TOKEN",
];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(js|css|html|json)$/.test(entry)) files.push(full);
  }
  return files;
}

const staticDir = path.join(process.cwd(), ".next/static");
if (!existsSync(staticDir)) {
  console.error("No production client output found at .next/static. Run npm run build first.");
  process.exit(1);
}

const files = walk(staticDir);
let failed = false;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const needle of needles) {
    if (text.includes(needle)) {
      console.error(`Found ${needle} in ${path.relative(process.cwd(), file)}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} client files. No server secret names found.`);
