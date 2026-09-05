import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export function BrandMark({
  href = "/",
  size = "md",
  inverted = false,
}: {
  href?: string;
  size?: "sm" | "md";
  inverted?: boolean;
}) {
  const icon = size === "sm" ? 32 : 36;
  const text = size === "sm" ? "text-lg" : "text-[1.35rem]";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 ${
        inverted ? "text-ink-foreground" : "text-foreground"
      }`}
    >
      <Image
        src="/icons/icon.svg"
        alt=""
        width={icon}
        height={icon}
        className="rounded-[12px_12px_12px_4px]"
        unoptimized
      />
      <span className={`font-display ${text} font-medium tracking-tight`}>
        {SITE_NAME}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="anim-fade-up mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-5 md:h-[82px] md:px-8">
      <BrandMark />
      <Link
        href="/#join"
        className="inline-flex min-h-11 items-center text-[0.92rem] font-semibold text-primary underline decoration-primary/40 underline-offset-[5px] transition-colors hover:decoration-primary"
      >
        Join the first 100
      </Link>
    </header>
  );
}
