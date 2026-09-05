import Image from "next/image";
import { Bird, Cat, Dog, PawPrint } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { COPY, HERO_BLUR_DATA_URL } from "@/lib/site-config";

const companions = [
  { label: "Dogs", icon: Dog },
  { label: "Cats", icon: Cat },
  { label: "Birds", icon: Bird },
];

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:px-8 md:pb-24 md:pt-8">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="space-y-6">
          <p className="anim-fade-up inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium tracking-[0.12em] text-secondary-foreground">
            <PawPrint className="anim-paw size-4 text-primary" aria-hidden="true" />
            {COPY.eyebrow}
          </p>
          <div className="anim-fade-up anim-delay-1 space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.4rem]">
              {COPY.headlineLead}
              <br />
              {COPY.headlineAccent}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {COPY.supporting}
            </p>
          </div>
          <div className="anim-fade-up anim-delay-2">
            <WaitlistForm />
          </div>
        </div>

        <div className="anim-scale-in anim-delay-2 relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            className="anim-blob absolute -left-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="anim-blob absolute -bottom-8 -right-4 size-32 rounded-full bg-accent/15 blur-2xl"
            aria-hidden="true"
            style={{ animationDelay: "2s" }}
          />
          <figure className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
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
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-[rgb(44_42_38_/_0.38)] via-[rgb(44_42_38_/_0.08)] to-transparent p-4 md:p-5">
              <ul className="flex flex-wrap gap-2">
                {companions.map((companion, index) => (
                  <li
                    key={companion.label}
                    className="anim-chip inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm"
                    style={{ animationDelay: `${400 + index * 90}ms` }}
                  >
                    <companion.icon className="size-3.5 text-primary" aria-hidden="true" />
                    {companion.label}
                  </li>
                ))}
              </ul>
              <p
                className="anim-chip hidden rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm sm:block"
                style={{ animationDelay: "680ms" }}
              >
                One household. Every companion.
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
