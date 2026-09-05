import { z } from "zod";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/site-config";

export const PET_TYPES = [
  "dog",
  "cat",
  "bird",
  "multiple",
  "other",
] as const;

export type PetType = (typeof PET_TYPES)[number];

export const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  multiple: "Multiple pets",
  other: "Other companion animal",
};

const optionalLimited = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

const attributionField = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }
      const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
      return cleaned.length > 0 ? cleaned.slice(0, max) : undefined;
    });

export const waitlistRequestSchema = z
  .strictObject({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(80, "Name is too long."),
    email: z
      .string()
      .trim()
      .min(3, "Enter a valid email address.")
      .max(254, "Email is too long.")
      .pipe(z.email("Enter a valid email address.")),
    petType: z.enum(PET_TYPES, {
      message: "Choose a pet type.",
    }),
    petName: optionalLimited(80),
    biggestChallenge: optionalLimited(500),
    consent: z.literal(true, {
      message: "Consent is required to join the waitlist.",
    }),
    website: z.string().max(200).optional().default(""),
    turnstileToken: z.string().min(1).max(4096),
    utmSource: attributionField(100),
    utmMedium: attributionField(100),
    utmCampaign: attributionField(100),
    utmContent: attributionField(100),
    referralSource: attributionField(100),
    landingPath: attributionField(200),
    referringDomain: attributionField(253),
  });

export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;

export const waitlistFormSchema = waitlistRequestSchema.omit({
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  utmContent: true,
  referralSource: true,
  landingPath: true,
  referringDomain: true,
  turnstileToken: true,
  website: true,
});

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const GENERIC_ERROR =
  "We couldn’t save your signup just now. Please try again in a moment.";

export const SETUP_ERROR =
  `This waitlist isn’t fully configured yet. Please try again shortly, or email ${DEFAULT_CONTACT_EMAIL}.`;

export const VERIFY_ERROR =
  "Please complete the verification check again, then resubmit.";

export const RATE_LIMIT_ERROR =
  "Please wait a few minutes before trying again.";
