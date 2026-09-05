import Link from "next/link";
import { BrandMark } from "@/components/site-header";
import { COPY, getContactEmail } from "@/lib/site-config";

export function SiteFooter() {
  const email = getContactEmail();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark size="sm" />
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              Terms
            </Link>
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center hover:text-foreground"
            >
              {email}
            </a>
          </nav>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {COPY.veterinaryDisclaimer}
        </p>
        <p className="text-sm text-muted-foreground">
          © {year} Animivo. Made with care for pets and their people.
        </p>
      </div>
    </footer>
  );
}
