import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { enforceWaitlistRateLimits, getClientIp } from "@/lib/security/rate-limit.server";
import { isAllowedRequestOrigin } from "@/lib/security/request-origin.server";
import { verifyTurnstileToken } from "@/lib/security/turnstile.server";
import { joinWaitlist } from "@/lib/supabase/admin.server";
import {
  GENERIC_ERROR,
  RATE_LIMIT_ERROR,
  SETUP_ERROR,
  VERIFY_ERROR,
  normalizeEmail,
  waitlistRequestSchema,
} from "@/lib/validation/waitlist";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

function logCategory(category: string) {
  console.error(`[waitlist] ${category}`);
}

export async function POST(request: Request) {
  try {
    getServerEnv();
  } catch {
    logCategory("env_unconfigured");
    return json(503, { ok: false, error: SETUP_ERROR });
  }

  if (!isAllowedRequestOrigin(request.headers)) {
    logCategory("origin_rejected");
    return json(403, { ok: false, error: GENERIC_ERROR });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(415, { ok: false, error: GENERIC_ERROR });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: GENERIC_ERROR });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json(400, { ok: false, error: GENERIC_ERROR });
  }

  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: GENERIC_ERROR });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw) as unknown;
  } catch {
    return json(400, { ok: false, error: GENERIC_ERROR });
  }

  const parsed = waitlistRequestSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return json(400, { ok: false, error: GENERIC_ERROR });
  }

  const payload = parsed.data;
  const { ip } = getClientIp(request.headers);
  const emailNormalized = normalizeEmail(payload.email);

  try {
    const allowed = await enforceWaitlistRateLimits({
      ip,
      emailNormalized,
    });
    if (!allowed) {
      return json(429, { ok: false, error: RATE_LIMIT_ERROR });
    }
  } catch {
    logCategory("rate_limit_backend");
    return json(503, { ok: false, error: SETUP_ERROR });
  }

  if (payload.website && payload.website.trim().length > 0) {
    return json(200, { ok: true, outcome: "joined" });
  }

  const turnstile = await verifyTurnstileToken(payload.turnstileToken);
  if (!turnstile.ok) {
    logCategory(`turnstile_${turnstile.reason}`);
    return json(400, { ok: false, error: VERIFY_ERROR });
  }

  try {
    const result = await joinWaitlist({
      email: payload.email,
      fullName: payload.fullName,
      petType: payload.petType,
      petName: payload.petName ?? null,
      biggestChallenge: payload.biggestChallenge ?? null,
      consent: true,
      utmSource: payload.utmSource ?? null,
      utmMedium: payload.utmMedium ?? null,
      utmCampaign: payload.utmCampaign ?? null,
      utmContent: payload.utmContent ?? null,
      referralSource: payload.referralSource ?? null,
      landingPath: payload.landingPath ?? null,
      referringDomain: payload.referringDomain ?? null,
    });

    return json(200, {
      ok: true,
      outcome: result.outcome,
    });
  } catch {
    logCategory("persist_failed");
    return json(500, { ok: false, error: GENERIC_ERROR });
  }
}

export async function GET() {
  return json(405, { ok: false, error: GENERIC_ERROR });
}
