import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export function BrandMark({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "sm" | "md";
}) {
  const icon = size === "sm" ? 28 : 36;
  const text = size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <Image
        src="/icons/icon.svg"
        alt=""
        width={icon}
        height={icon}
        className="rounded-[28%]"
        unoptimized
      />
      <span className={`font-display ${text} font-semibold tracking-tight text-foreground`}>
        {SITE_NAME}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="anim-fade-up mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
      <BrandMark />
      <a
        href="#join"
        className="btn-ease inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:bg-[var(--brand-primary-hover)]"
      >
        Join the first 100
      </a>
    </header>
  );
}
