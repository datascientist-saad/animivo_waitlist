import Link from "next/link";
import { BrandMark } from "@/components/site-header";
import { COPY, getContactEmail } from "@/lib/site-config";

export function SiteFooter() {
  const email = getContactEmail();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-5 py-9 md:px-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark size="sm" />
          <p className="text-sm text-muted-foreground">
            Better care starts with knowing what your pet needs.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-foreground"
          >
            Terms
          </Link>
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-foreground"
          >
            {email}
          </a>
        </nav>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {COPY.veterinaryDisclaimer}
        </p>
        <p className="text-sm text-muted-foreground">© {year} Animivo</p>
      </div>
    </footer>
  );
}
