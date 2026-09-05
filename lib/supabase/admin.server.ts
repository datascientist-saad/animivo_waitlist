import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env.server";

let client: SupabaseClient | undefined;

export function getAdminSupabase() {
  if (client) {
    return client;
  }

  const env = getServerEnv();
  client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}

export type JoinWaitlistRpcResult = {
  outcome: "joined" | "already_joined";
  founding_member: boolean;
};

export async function joinWaitlist(params: {
  email: string;
  fullName: string;
  petType: string;
  petName: string | null;
  biggestChallenge: string | null;
  consent: true;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referralSource: string | null;
  landingPath: string | null;
  referringDomain: string | null;
}): Promise<JoinWaitlistRpcResult> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.rpc("join_animivo_waitlist", {
    p_email: params.email,
    p_full_name: params.fullName,
    p_pet_type: params.petType,
    p_pet_name: params.petName,
    p_biggest_challenge: params.biggestChallenge,
    p_consent: params.consent,
    p_utm_source: params.utmSource,
    p_utm_medium: params.utmMedium,
    p_utm_campaign: params.utmCampaign,
    p_utm_content: params.utmContent,
    p_referral_source: params.referralSource,
    p_landing_path: params.landingPath,
    p_referring_domain: params.referringDomain,
  });

  if (error || !data) {
    console.error("Waitlist persistence failed.");
    throw new Error("WAITLIST_PERSISTENCE_FAILED");
  }

  const result = data as JoinWaitlistRpcResult;
  if (result.outcome !== "joined" && result.outcome !== "already_joined") {
    console.error("Waitlist persistence returned an unexpected result.");
    throw new Error("WAITLIST_PERSISTENCE_FAILED");
  }

  return {
    outcome: result.outcome,
    founding_member: Boolean(result.founding_member),
  };
}

export async function consumeSupabaseRateLimit(input: {
  bucketHash: string;
  windowSeconds: number;
  maxAttempts: number;
}): Promise<boolean> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.rpc("consume_waitlist_rate_limit", {
    p_bucket_hash: input.bucketHash,
    p_window_seconds: input.windowSeconds,
    p_max_attempts: input.maxAttempts,
  });

  if (error || typeof data !== "boolean") {
    console.error("Rate-limit backend failed.");
    throw new Error("RATE_LIMIT_BACKEND_FAILED");
  }

  return data;
}
