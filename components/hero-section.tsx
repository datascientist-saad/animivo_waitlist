import Image from "next/image";
import { PawPrint } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { COPY, HERO_BLUR_DATA_URL } from "@/lib/site-config";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:px-8 md:pb-24 md:pt-8">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium tracking-[0.12em] text-secondary-foreground">
            <PawPrint className="size-4 text-primary" aria-hidden="true" />
            {COPY.eyebrow}
          </p>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.4rem]">
              {COPY.headlineLead}
              <br />
              {COPY.headlineAccent}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {COPY.supporting}
            </p>
          </div>
          <WaitlistForm />
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            className="absolute -left-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-8 -right-4 size-32 rounded-full bg-accent/15 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <Image
              src="/images/animivo-waitlist-hero.webp"
              alt="A golden retriever, a tabby cat, and a green budgerigar together in a sunlit living room"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL={HERO_BLUR_DATA_URL}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
