import { NextResponse, type NextRequest } from "next/server";

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  const analytics =
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
      ? " https://va.vercel-scripts.com https://vitals.vercel-insights.com"
      : "";

  // Do not use strict-dynamic: it ignores host allowlists and blocks Turnstile.
  // Next.js applies this nonce to its own scripts on dynamically rendered pages.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "https://challenges.cloudflare.com",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' https://challenges.cloudflare.com${analytics}`,
    "frame-src https://challenges.cloudflare.com",
    "child-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source:
            "/((?!api|_next/static|_next/image|favicon.ico|icons/|images/|brand/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
