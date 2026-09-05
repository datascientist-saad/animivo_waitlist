import { Check } from "lucide-react";

const perks = [
  "Priority early access",
  "Direct input into upcoming features",
  "Founding-member recognition",
];

export function FoundingBenefits() {
  return (
    <section
      aria-labelledby="founding-heading"
      className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="anim-fade-up">
          <h2
            id="founding-heading"
            className="font-display text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Help shape Animivo from day one.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            We’re inviting our first 100 pet parents before public launch. Your
            routines, needs, and honest feedback will help decide what we build
            next.
          </p>
        </div>
        <ul className="anim-scale-in anim-delay-2 space-y-3 rounded-[2rem] border border-border bg-card p-6 shadow-soft">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
