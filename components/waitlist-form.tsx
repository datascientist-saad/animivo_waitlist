"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { captureClientAttribution } from "@/lib/attribution";
import { COPY } from "@/lib/site-config";
import {
  GENERIC_ERROR,
  PET_TYPE_LABELS,
  PET_TYPES,
  RATE_LIMIT_ERROR,
  waitlistFormSchema,
  type WaitlistRequest,
} from "@/lib/validation/waitlist";
import type { Resolver } from "react-hook-form";

type FormValues = {
  fullName: string;
  email: string;
  petType: (typeof PET_TYPES)[number] | "";
  petName?: string;
  biggestChallenge?: string;
  consent: boolean;
};

type SubmitOutcome = "joined" | "already_joined";

export function WaitlistForm() {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const [token, setToken] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const allowClientDevToken =
    process.env.NODE_ENV !== "production" && siteKey.length === 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(waitlistFormSchema) as Resolver<FormValues>,
    defaultValues: {
      fullName: "",
      email: "",
      petType: "",
      petName: "",
      biggestChallenge: "",
      consent: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const turnstileToken = allowClientDevToken ? "dev-bypass" : token;
    if (!turnstileToken) {
      setServerError("Please complete the verification check.");
      return;
    }

    const attribution = captureClientAttribution({
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: document.referrer,
    });

    const body: WaitlistRequest = {
      fullName: values.fullName,
      email: values.email,
      petType: values.petType as WaitlistRequest["petType"],
      petName: values.petName,
      biggestChallenge: values.biggestChallenge,
      consent: true,
      website: honeypotRef.current?.value ?? "",
      turnstileToken,
      utmSource: attribution.utmSource ?? undefined,
      utmMedium: attribution.utmMedium ?? undefined,
      utmCampaign: attribution.utmCampaign ?? undefined,
      utmContent: attribution.utmContent ?? undefined,
      referralSource: attribution.referralSource ?? undefined,
      landingPath: attribution.landingPath,
      referringDomain: attribution.referringDomain ?? undefined,
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; outcome?: SubmitOutcome; error?: string }
        | null;

      if (response.status === 429) {
        setServerError(payload?.error || RATE_LIMIT_ERROR);
        turnstileRef.current?.reset();
        setToken("");
        return;
      }

      if (!response.ok || !payload?.ok) {
        setServerError(payload?.error || GENERIC_ERROR);
        turnstileRef.current?.reset();
        setToken("");
        return;
      }

      if (payload.outcome === "already_joined" || payload.outcome === "joined") {
        setOutcome(payload.outcome);
        return;
      }

      setServerError(GENERIC_ERROR);
      turnstileRef.current?.reset();
      setToken("");
    } catch {
      setServerError(GENERIC_ERROR);
      turnstileRef.current?.reset();
      setToken("");
    }
  }

  if (outcome) {
    const title =
      outcome === "already_joined" ? COPY.duplicate : COPY.successTitle;
    const body = outcome === "already_joined" ? null : COPY.successBody;

    return (
      <div
        className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft md:p-6"
        role="status"
        aria-live="polite"
      >
        <p className="font-display text-2xl font-semibold tracking-tight">{title}</p>
        {body ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
        ) : null}
      </div>
    );
  }

  const fieldClass =
    "min-h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-base text-foreground shadow-sm placeholder:text-muted-foreground/80 disabled:opacity-60";

  return (
    <form
      id="join"
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft md:p-6"
      noValidate
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            autoComplete="name"
            className={fieldClass}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p id="fullName-error" className="mt-1 text-sm text-destructive">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={fieldClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" className="mt-1 text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="petType" className="mb-1.5 block text-sm font-medium">
            Pet type
          </label>
          <select
            id="petType"
            className={fieldClass}
            aria-invalid={Boolean(errors.petType)}
            aria-describedby={errors.petType ? "petType-error" : undefined}
            defaultValue=""
            {...register("petType")}
          >
            <option value="" disabled>
              Select one
            </option>
            {PET_TYPES.map((type) => (
              <option key={type} value={type}>
                {PET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.petType ? (
            <p id="petType-error" className="mt-1 text-sm text-destructive">
              {errors.petType.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="petName" className="mb-1.5 block text-sm font-medium">
            Pet’s name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="petName"
            autoComplete="off"
            className={fieldClass}
            aria-invalid={Boolean(errors.petName)}
            aria-describedby={errors.petName ? "petName-error" : undefined}
            {...register("petName")}
          />
          {errors.petName ? (
            <p id="petName-error" className="mt-1 text-sm text-destructive">
              {errors.petName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="biggestChallenge" className="mb-1.5 block text-sm font-medium">
            Biggest pet-care challenge{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="biggestChallenge"
            rows={3}
            className="w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-base text-foreground shadow-sm placeholder:text-muted-foreground/80 disabled:opacity-60"
            aria-invalid={Boolean(errors.biggestChallenge)}
            aria-describedby={
              errors.biggestChallenge ? "biggestChallenge-error" : "biggestChallenge-hint"
            }
            {...register("biggestChallenge")}
          />
          <p id="biggestChallenge-hint" className="mt-1 text-xs text-muted-foreground">
            Everyday care, feeding, reminders, or organization—not medical records.
          </p>
          {errors.biggestChallenge ? (
            <p id="biggestChallenge-error" className="mt-1 text-sm text-destructive">
              {errors.biggestChallenge.message}
            </p>
          ) : null}
        </div>

        <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Company website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            ref={honeypotRef}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="consent"
            type="checkbox"
            className="mt-1 size-5 shrink-0 rounded border-border text-primary accent-[var(--brand-primary)]"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            {...register("consent")}
          />
          <label htmlFor="consent" className="text-sm leading-relaxed">
            {COPY.consent}
          </label>
        </div>
        {errors.consent ? (
          <p id="consent-error" className="text-sm text-destructive">
            {errors.consent.message}
          </p>
        ) : null}

        {siteKey ? (
          <div className="min-h-[65px]">
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(value) => setToken(value)}
              onExpire={() => setToken("")}
              onError={() => setToken("")}
              options={{
                appearance: "always",
                size: "flexible",
              }}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Bot protection is configured on the server. Local development can use a
            documented bypass only when explicitly enabled.
          </p>
        )}

        <div aria-live="polite" aria-atomic="true">
          {serverError ? (
            <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Joining…
            </>
          ) : (
            COPY.primaryCta
          )}
        </button>
        <p className="text-sm text-muted-foreground">{COPY.privacyReassurance}</p>
      </div>
    </form>
  );
}
