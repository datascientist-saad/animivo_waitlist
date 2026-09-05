import "server-only";

import { getServerEnv } from "@/lib/env.server";

type TurnstileApiResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const env = getServerEnv();
  const bypassAllowed =
    env.ALLOW_DEV_TURNSTILE_BYPASS === "true" &&
    env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "production";

  if (bypassAllowed && token === "dev-bypass") {
    return { ok: true as const };
  }

  if (!token || token === "dev-bypass") {
    return { ok: false as const };
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

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
      console.error("Turnstile verification request failed.");
      return { ok: false as const };
    }

    const payload = (await response.json()) as TurnstileApiResponse;
    if (!payload.success) {
      return { ok: false as const };
    }

    return { ok: true as const };
  } catch {
    console.error("Turnstile verification could not be completed.");
    return { ok: false as const };
  }
}
