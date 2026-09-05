import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { enforceWaitlistRateLimits, getClientIp } from "@/lib/security/rate-limit.server";
import { isAllowedRequestOrigin } from "@/lib/security/request-origin.server";
import { verifyTurnstileToken } from "@/lib/security/turnstile.server";
import { joinWaitlist } from "@/lib/supabase/admin.server";
import {
  GENERIC_ERROR,
  RATE_LIMIT_ERROR,
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

function genericError(status = 400) {
  return json(status, { ok: false, error: GENERIC_ERROR });
}

export async function POST(request: Request) {
  try {
    getServerEnv();
  } catch {
    return genericError(500);
  }

  if (!isAllowedRequestOrigin(request.headers)) {
    return genericError(403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return genericError(415);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return genericError(413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return genericError(400);
  }

  if (raw.length > MAX_BODY_BYTES) {
    return genericError(413);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw) as unknown;
  } catch {
    return genericError(400);
  }

  const parsed = waitlistRequestSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return genericError(400);
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
    return genericError(500);
  }

  if (payload.website && payload.website.trim().length > 0) {
    return json(200, { ok: true, outcome: "joined" });
  }

  const turnstile = await verifyTurnstileToken(payload.turnstileToken, ip);
  if (!turnstile.ok) {
    return genericError(400);
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
    return genericError(500);
  }
}

export async function GET() {
  return json(405, { ok: false, error: GENERIC_ERROR });
}
