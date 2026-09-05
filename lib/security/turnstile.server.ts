import "server-only";

import { getServerEnv } from "@/lib/env.server";

type TurnstileApiResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "rejected" | "unavailable" };

export async function verifyTurnstileToken(token: string): Promise<TurnstileResult> {
  const env = getServerEnv();
  const bypassAllowed =
    env.ALLOW_DEV_TURNSTILE_BYPASS === "true" &&
    env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "production";

  if (bypassAllowed && token === "dev-bypass") {
    return { ok: true };
  }

  if (!token || token === "dev-bypass") {
    return { ok: false, reason: "missing" };
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY.trim(),
    response: token,
  });

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!response.ok) {
      console.error("[waitlist] turnstile_unavailable");
      return { ok: false, reason: "unavailable" };
    }

    const payload = (await response.json()) as TurnstileApiResponse;
    if (!payload.success) {
      console.error("[waitlist] turnstile_rejected");
      return { ok: false, reason: "rejected" };
    }

    return { ok: true };
  } catch {
    console.error("[waitlist] turnstile_unavailable");
    return { ok: false, reason: "unavailable" };
  }
}
