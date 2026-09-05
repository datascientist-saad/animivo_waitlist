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
  const icon = size === "sm" ? 36 : 44;
  const text = size === "sm" ? "text-lg" : "text-[1.35rem]";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <Image
        src="/brand/animivo-app-icon.png"
        alt=""
        width={icon}
        height={icon}
        className="rounded-[10px] shadow-soft"
        priority={size === "md"}
      />
      <span className={`font-display ${text} font-medium tracking-tight text-foreground`}>
        {SITE_NAME}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="anim-fade-up mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between gap-4 px-5 md:h-[82px] md:px-8">
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
