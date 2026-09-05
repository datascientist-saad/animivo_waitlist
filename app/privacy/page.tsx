import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContactEmail, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects and uses waitlist information.`,
};

export default function PrivacyPage() {
  const email = getContactEmail();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 5 September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
          <p>
            This page describes how Animivo collects and uses information submitted on
            this waitlist website. It is not a claim of GDPR, CCPA, HIPAA, SOC 2, or
            ISO certification.
          </p>
          <section>
            <h2 className="font-display text-2xl font-semibold">What we collect</h2>
            <p className="mt-2 text-muted-foreground">
              When you join the waitlist we collect your name, email address, pet type,
              optional pet name, optional description of a pet-care challenge, and your
              marketing-email consent (including the time you consented). We also store
              campaign attribution such as sanitized UTM values, a referral code
              parameter, the landing-page path, and the hostname of the referring site
              when it can be parsed. We do not store full referrer URLs, raw IP
              addresses, browser fingerprints, pet medical documents, or detailed
              medical records.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Why we collect it</h2>
            <p className="mt-2 text-muted-foreground">
              We use this information to send early-access invitations, occasional
              product updates, and to understand which public communities helped people
              find Animivo. Optional challenge responses are used only as product
              research, not as medical data.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Email and unsubscribe</h2>
            <p className="mt-2 text-muted-foreground">
              We only send waitlist and product emails if you check the consent box. You
              can unsubscribe at any time using the link in those emails or by writing
              to {email}.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Access and deletion</h2>
            <p className="mt-2 text-muted-foreground">
              You can ask us to correct or delete your waitlist information by emailing{" "}
              {email}. We will process reasonable requests from the email address on
              the signup.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Storage and processors</h2>
            <p className="mt-2 text-muted-foreground">
              Signups are stored in a Supabase (PostgreSQL) database operated by the
              Animivo project owner. Bot protection is provided by Cloudflare Turnstile.
              Optional rate-limiting may use Upstash Redis. This site may be hosted on
              Vercel. We do not sell waitlist data.
            </p>
          </section>
          <p>
            Questions:{" "}
            <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
            . See also our <Link href="/terms">Terms</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
