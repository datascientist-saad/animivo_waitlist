import "server-only";

import { getServerEnv } from "@/lib/env.server";

export function isAllowedRequestOrigin(headers: Headers) {
  const env = getServerEnv();
  const isProduction =
    env.NODE_ENV === "production" || env.VERCEL_ENV === "production";

  if (!isProduction) {
    return true;
  }

  const allowed = new Set<string>();
  try {
    allowed.add(new URL(env.NEXT_PUBLIC_SITE_URL).origin);
  } catch {
    return false;
  }

  if (env.VERCEL_URL) {
    allowed.add(`https://${env.VERCEL_URL}`);
  }

  const origin = headers.get("origin");
  const referer = headers.get("referer");

  if (origin) {
    return allowed.has(origin);
  }

  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}
