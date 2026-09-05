import { Check } from "lucide-react";
import Link from "next/link";

const perks = [
  "Priority early access",
  "Direct input into upcoming features",
  "Founding-member recognition",
];

export function FoundingBenefits() {
  return (
    <section
      aria-labelledby="founding-heading"
      className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 py-16 md:px-8 md:py-[110px] lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
    >
      <div
        className="anim-scale-in mx-auto grid h-[250px] w-[250px] rotate-[-3deg] place-items-center rounded-[50%_50%_48%_52%] bg-accent font-display text-[7rem] font-medium leading-none tracking-[-0.08em] text-[var(--brand-background)] md:h-[340px] md:w-[340px] md:text-[8.5rem] lg:h-[390px] lg:w-[390px] lg:text-[9rem]"
        aria-hidden="true"
      >
        100
      </div>
      <div className="anim-fade-up anim-delay-1 founding-copy">
        <p className="eyebrow-kicker text-[0.76rem] font-extrabold">The founding group</p>
        <h2
          id="founding-heading"
          className="font-display mt-4 text-[2.4rem] font-medium leading-[1.04] tracking-[-0.045em] md:text-[3.6rem]"
        >
          Help shape Animivo from day one.
        </h2>
        <p className="mt-4 max-w-xl text-[1.04rem] leading-[1.7] text-muted-foreground">
          We’re inviting our first 100 pet parents before public launch. Your
          routines, needs, and honest feedback will help decide what we build
          next.
        </p>
        <ul className="mt-6 grid gap-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
              <Check className="size-[17px] shrink-0 text-accent" aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>
        <Link
          href="/#join"
          className="mt-8 inline-flex min-h-11 items-center font-extrabold text-primary underline decoration-primary/30 underline-offset-8"
        >
          Save my place <span className="ml-1.5">→</span>
        </Link>
      </div>
    </section>
  );
}
