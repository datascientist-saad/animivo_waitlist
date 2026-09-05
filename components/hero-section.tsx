import Image from "next/image";
import { HeartPulse, Salad, ShieldCheck, Sparkles } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { COPY, HERO_BLUR_DATA_URL } from "@/lib/site-config";

export function HeroSection() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:pb-24"
    >
      <div className="hero-copy">
        <p className="eyebrow-kicker anim-fade-up inline-flex items-center gap-2 text-[0.76rem] font-extrabold">
          <Sparkles className="anim-paw size-[15px]" aria-hidden="true" />
          {COPY.eyebrow}
        </p>
        <div className="anim-fade-up anim-delay-1">
          <h1 className="font-display mt-5 max-w-[660px] text-[clamp(2.65rem,5.4vw,5.1rem)] font-medium leading-[0.98] tracking-[-0.05em] text-foreground">
            {COPY.headlineLead}
            <br />
            <span className="headline-accent">{COPY.headlineAccent}</span>
          </h1>
          <p className="mt-6 max-w-[590px] text-[1.05rem] leading-relaxed text-muted-foreground md:text-[1.15rem] md:leading-[1.65]">
            {COPY.supporting}
          </p>
        </div>
        <div className="anim-fade-up anim-delay-2 mt-8" id="join">
          <WaitlistForm />
        </div>
        <p className="anim-fade-up anim-delay-3 mt-3 flex items-center gap-1.5 text-[0.76rem] text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          {COPY.privacyReassurance}
        </p>
      </div>

      <div className="anim-scale-in anim-delay-2 relative mx-auto w-full max-w-xl lg:max-w-none">
        <div className="hero-visual relative min-h-[420px] overflow-hidden rounded-[2.5rem] sm:min-h-[520px] sm:rounded-[170px_170px_24px_24px] lg:min-h-[610px]">
          <Image
            src="/images/animivo-waitlist-hero.webp"
            alt="A golden retriever, a tabby cat, and a green budgerigar together in a sunlit living room"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 48vw"
            placeholder="blur"
            blurDataURL={HERO_BLUR_DATA_URL}
            className="object-cover object-[60%_center]"
          />
          <div className="anim-float anim-chip absolute left-3 top-6 z-[2] flex max-w-[220px] items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-3 shadow-[0_12px_32px_rgb(44_42_38_/_0.14)] backdrop-blur-md sm:left-5 sm:top-16">
            <HeartPulse className="size-[18px] shrink-0 text-accent" aria-hidden="true" />
            <span className="text-[0.8rem] leading-snug text-foreground">
              <strong className="block font-semibold">Health routines</strong>
              Never miss what matters
            </span>
          </div>
          <div className="anim-float-delayed anim-chip absolute bottom-5 right-3 z-[2] flex max-w-[220px] items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3.5 py-3 shadow-[0_12px_32px_rgb(44_42_38_/_0.14)] backdrop-blur-md sm:bottom-11 sm:right-5">
            <Salad className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
            <span className="text-[0.8rem] leading-snug text-foreground">
              <strong className="block font-semibold">Smarter feeding</strong>
              Guidance for their needs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
