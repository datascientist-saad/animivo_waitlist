import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { COPY, getContactEmail, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Terms | ${SITE_NAME}`,
  description: `Terms for using the ${SITE_NAME} waitlist website.`,
};

export default function TermsPage() {
  const email = getContactEmail();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Terms</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 5 September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <p>
            These terms apply to this waitlist website. They are not a veterinary
            agreement, and they do not contain fabricated company registration details.
          </p>
          <section>
            <h2 className="font-display text-2xl font-semibold">The waitlist</h2>
            <p className="mt-2 text-muted-foreground">
              Joining the Founding 100 waitlist requests early access and the chance to
              share product feedback. We do not promise lifetime access, lifetime
              discounts, free subscriptions, or monetary rewards. Founding-member
              designation is assigned to the first 100 unique signups.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Pet-care guidance</h2>
            <p className="mt-2 text-muted-foreground">{COPY.veterinaryDisclaimer}</p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Acceptable use</h2>
            <p className="mt-2 text-muted-foreground">
              Do not use automated tools to submit false signups, attempt to access
              other people’s data, or interfere with this website. We may ignore or
              remove abusive submissions.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold">Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Email{" "}
              <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${email}`}>
                {email}
              </a>
              . Review the <Link href="/privacy">Privacy Policy</Link> for data details.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
