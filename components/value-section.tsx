import { HeartHandshake, NotebookPen, PawPrint } from "lucide-react";
import { COPY } from "@/lib/site-config";

const benefits = [
  {
    icon: PawPrint,
    title: "A plan that fits your pet",
    body: "Helpful care and feeding guidance shaped around species, age, weight, and lifestyle.",
  },
  {
    icon: NotebookPen,
    title: "Everything remembered",
    body: "Vaccinations, routines, meals, and important health notes kept in one organized place.",
  },
  {
    icon: HeartHandshake,
    title: "Made for more than cats and dogs",
    body: "Animivo is being designed for dogs, cats, birds, and other companion animals.",
  },
];

export function ValueSection() {
  return (
    <section
      aria-labelledby="value-heading"
      className="border-y border-border bg-[color-mix(in_srgb,var(--brand-surface)_40%,transparent)] px-4 py-16 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="value-heading"
          className="anim-fade-up font-display text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Less guessing. More good days together.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`lift-card anim-fade-up rounded-2xl border border-border bg-card p-6 shadow-soft ${
                index === 0 ? "anim-delay-1" : index === 1 ? "anim-delay-2" : "anim-delay-3"
              }`}
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <benefit.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {COPY.veterinaryDisclaimer}
        </p>
      </div>
    </section>
  );
}
