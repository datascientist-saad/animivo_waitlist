const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export function sanitizeLimitedString(
  value: string | null | undefined,
  max: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(CONTROL_CHARS, "").trim().slice(0, max);
  return cleaned.length > 0 ? cleaned : null;
}

export function extractReferringDomain(
  referrer: string | null | undefined,
): string | null {
  if (!referrer) {
    return null;
  }

  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return sanitizeLimitedString(url.hostname, 253);
  } catch {
    return null;
  }
}

export function sanitizeLandingPath(pathname: string | null | undefined) {
  const value = sanitizeLimitedString(pathname, 200);
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/")) {
    return "/";
  }

  if (value.includes("?") || value.includes("#")) {
    return value.split(/[?#]/, 1)[0] ?? "/";
  }

  return value;
}

export function captureClientAttribution(input: {
  search: string;
  pathname: string;
  referrer: string;
}) {
  const params = new URLSearchParams(input.search);

  return {
    utmSource: sanitizeLimitedString(params.get("utm_source"), 100),
    utmMedium: sanitizeLimitedString(params.get("utm_medium"), 100),
    utmCampaign: sanitizeLimitedString(params.get("utm_campaign"), 100),
    utmContent: sanitizeLimitedString(params.get("utm_content"), 100),
    referralSource: sanitizeLimitedString(params.get("ref"), 100),
    landingPath: sanitizeLandingPath(input.pathname),
    referringDomain: extractReferringDomain(input.referrer),
  };
}
