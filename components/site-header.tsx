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
  const height = size === "sm" ? 56 : 72;
  const width = Math.round((1400 / 849) * height);

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-80"
      aria-label={SITE_NAME}
    >
      <Image
        src="/brand/animivo-logo.png"
        alt={SITE_NAME}
        width={width}
        height={height}
        className={size === "sm" ? "h-14 w-auto" : "h-16 w-auto md:h-[4.5rem]"}
        priority={size === "md"}
      />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="anim-fade-up mx-auto flex h-[88px] w-full max-w-[1240px] items-center justify-between gap-4 px-5 md:h-[96px] md:px-8">
      <BrandMark />
      <Link
        href="/#join"
        className="inline-flex min-h-11 shrink-0 items-center text-[0.92rem] font-semibold text-primary underline decoration-primary/40 underline-offset-[5px] transition-colors hover:decoration-primary"
      >
        Join the first 100
      </Link>
    </header>
  );
}
