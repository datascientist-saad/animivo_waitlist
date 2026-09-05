import "server-only";

import { getServerEnv } from "@/lib/env.server";

function normalizeHost(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "") || null;
}

function hostFromUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return normalizeHost(new URL(value).host);
  } catch {
    try {
      return normalizeHost(new URL(`https://${value}`).host);
    } catch {
      return null;
    }
  }
}

export function isAllowedRequestOrigin(headers: Headers) {
  const env = getServerEnv();
  const isProduction =
    env.NODE_ENV === "production" || env.VERCEL_ENV === "production";

  if (!isProduction) {
    return true;
  }

  const requestHost =
    normalizeHost(headers.get("x-forwarded-host")) ??
    normalizeHost(headers.get("host"));

  const allowedHosts = new Set<string>();
  if (requestHost) {
    allowedHosts.add(requestHost);
  }

  const siteHost = hostFromUrl(env.NEXT_PUBLIC_SITE_URL);
  if (siteHost) {
    allowedHosts.add(siteHost);
  }

  if (env.VERCEL_URL) {
    const vercelHost = hostFromUrl(`https://${env.VERCEL_URL}`);
    if (vercelHost) {
      allowedHosts.add(vercelHost);
    }
  }

  const productionHost = hostFromUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (productionHost) {
    allowedHosts.add(productionHost);
  }

  const origin = headers.get("origin");
  if (origin) {
    const originHost = hostFromUrl(origin);
    return Boolean(originHost && allowedHosts.has(originHost));
  }

  const referer = headers.get("referer");
  if (referer) {
    const refererHost = hostFromUrl(referer);
    return Boolean(refererHost && allowedHosts.has(refererHost));
  }

  return false;
}
