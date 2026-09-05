import { COPY } from "@/lib/site-config";

const benefits = [
  {
    number: "01",
    title: "A plan that fits your pet",
    body: "Helpful care and feeding guidance shaped around species, age, weight, and lifestyle.",
  },
  {
    number: "02",
    title: "Everything remembered",
    body: "Vaccinations, routines, meals, and important health notes kept in one organized place.",
  },
  {
    number: "03",
    title: "Made for more than cats and dogs",
    body: "Animivo is being designed for dogs, cats, birds, and other companion animals.",
  },
];

export function ValueSection() {
  return (
    <section
      aria-labelledby="value-heading"
      className="bg-[var(--brand-ink)] px-5 py-16 text-[var(--brand-ink-foreground)] md:px-8 md:py-[100px]"
    >
      <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-[70px]">
        <div className="anim-fade-up">
          <p className="text-[0.76rem] font-extrabold uppercase tracking-[0.14em] text-accent">
            Built around real pet life
          </p>
          <h2
            id="value-heading"
            className="font-display mt-4 text-[2.4rem] font-medium leading-[1.04] tracking-[-0.045em] md:text-[3.6rem]"
          >
            Less guessing.
            <br />
            More good days together.
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-5">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`anim-fade-up border-t border-white/25 pt-5 ${
                index === 0 ? "anim-delay-1" : index === 1 ? "anim-delay-2" : "anim-delay-3"
              }`}
            >
              <p className="text-[0.76rem] font-extrabold text-accent">{benefit.number}</p>
              <h3 className="mt-10 font-display text-[1.12rem] font-medium tracking-tight">
                {benefit.title}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-white/70">{benefit.body}</p>
            </article>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-[1120px] text-sm leading-relaxed text-white/60">
        {COPY.veterinaryDisclaimer}
      </p>
    </section>
  );
}
