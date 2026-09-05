export const SITE_NAME = "Animivo AI";

export const DEFAULT_CONTACT_EMAIL = "hello@animivo.app";

export function getContactEmail() {
  return process.env.ANIMIVO_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
}

export function getPublicSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export const COPY = {
  title: "Animivo AI Early Access | Better Pet Care, Made Clear",
  description:
    "Join the first 100 pet parents shaping Animivo—one calm place for feeding guidance, health routines, vaccination reminders, and everyday pet care.",
  eyebrow: "EARLY ACCESS FOR THOUGHTFUL PET PARENTS",
  headlineLead: "Pet care is a lot.",
  headlineAccent: "Animivo makes it clear.",
  supporting:
    "One calm place for feeding guidance, health routines, vaccination reminders, and the little details that keep your pet thriving.",
  primaryCta: "Join the founding 100",
  privacyReassurance:
    "No spam. Just product updates and your early-access invite.",
  consent:
    "I agree to receive Animivo early-access and product emails. I can unsubscribe at any time.",
  successTitle: "You’re on the list.",
  successBody:
    "Watch your inbox—we’ll send your early-access invitation and occasional product updates.",
  duplicate:
    "You’re already on the Animivo list. We’ll keep your place safe.",
  veterinaryDisclaimer:
    "Animivo provides general pet-care guidance and organization tools. It does not replace advice, diagnosis, or treatment from a qualified veterinarian.",
} as const;

export const HERO_BLUR_DATA_URL =
  "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADwAQCdASoQAAsAA4BaJagCdADQ80XugAAA/uuFev6ZeinyyphuknsXRTRa0fwfAzkDCL8fiQY1tDWmhlB+ih/4UBZfyv8yxe2SxByMv5N2mN02EURRpdy6AAA=";
