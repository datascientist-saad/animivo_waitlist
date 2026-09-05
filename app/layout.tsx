import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { COPY, getPublicSiteUrl, SITE_NAME } from "@/lib/site-config";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getPublicSiteUrl();

export const viewport: Viewport = {
  themeColor: "#6B8F71",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: COPY.title,
  description: COPY.description,
  applicationName: SITE_NAME,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  alternates: siteUrl ? { canonical: siteUrl } : undefined,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: COPY.title,
    description: COPY.description,
    type: "website",
    siteName: SITE_NAME,
    url: siteUrl ?? undefined,
  },
  twitter: {
    card: "summary",
    title: COPY.title,
    description: COPY.description,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading request headers opts the app into dynamic rendering so Next.js
  // can attach the CSP nonce to its runtime scripts.
  await headers();

  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
