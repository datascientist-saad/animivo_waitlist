-- Animivo waitlist: signups, atomic Founding 100 assignment, and rate-limit fallback.
-- Apply in the Supabase SQL editor or with the Supabase CLI.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  full_name text not null,
  pet_type text not null,
  pet_name text,
  biggest_challenge text,
  consent boolean not null,
  consent_timestamp timestamptz not null,
  founding_member boolean not null default false,
  waitlist_position bigint,
  referral_code text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referral_source text,
  landing_path text,
  referring_domain text,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_signups_email_len check (char_length(email) between 3 and 254),
  constraint waitlist_signups_email_normalized_len check (char_length(email_normalized) between 3 and 254),
  constraint waitlist_signups_full_name_len check (char_length(full_name) between 2 and 80),
  constraint waitlist_signups_pet_name_len check (pet_name is null or char_length(pet_name) <= 80),
  constraint waitlist_signups_challenge_len check (biggest_challenge is null or char_length(biggest_challenge) <= 500),
  constraint waitlist_signups_utm_source_len check (utm_source is null or char_length(utm_source) <= 100),
  constraint waitlist_signups_utm_medium_len check (utm_medium is null or char_length(utm_medium) <= 100),
  constraint waitlist_signups_utm_campaign_len check (utm_campaign is null or char_length(utm_campaign) <= 100),
  constraint waitlist_signups_utm_content_len check (utm_content is null or char_length(utm_content) <= 100),
  constraint waitlist_signups_referral_source_len check (referral_source is null or char_length(referral_source) <= 100),
  constraint waitlist_signups_landing_path_len check (landing_path is null or char_length(landing_path) <= 200),
  constraint waitlist_signups_referring_domain_len check (referring_domain is null or char_length(referring_domain) <= 253),
  constraint waitlist_signups_referral_code_len check (char_length(referral_code) between 16 and 64),
  constraint waitlist_signups_pet_type_allowed check (
    pet_type in ('dog', 'cat', 'bird', 'multiple', 'other')
  ),
  constraint waitlist_signups_status_allowed check (
    status in ('waiting', 'invited', 'onboarded', 'unsubscribed', 'deleted')
  ),
  constraint waitlist_signups_consent_true check (consent = true)
);

create unique index if not exists waitlist_signups_email_normalized_uidx
  on public.waitlist_signups (email_normalized);

create unique index if not exists waitlist_signups_referral_code_uidx
  on public.waitlist_signups (referral_code);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at);

create index if not exists waitlist_signups_utm_source_idx
  on public.waitlist_signups (utm_source);

create index if not exists waitlist_signups_referral_source_idx
  on public.waitlist_signups (referral_source);

create index if not exists waitlist_signups_founding_member_idx
  on public.waitlist_signups (founding_member);

drop trigger if exists waitlist_signups_set_updated_at on public.waitlist_signups;
create trigger waitlist_signups_set_updated_at
  before update on public.waitlist_signups
  for each row
  execute function public.set_updated_at();

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_signups force row level security;

revoke all on table public.waitlist_signups from public, anon, authenticated;
grant all on table public.waitlist_signups to service_role;

create table if not exists public.waitlist_rate_limits (
  bucket_hash text primary key,
  window_started_at timestamptz not null,
  attempt_count integer not null,
  updated_at timestamptz not null default now(),
  constraint waitlist_rate_limits_hash_len check (char_length(bucket_hash) between 16 and 128),
  constraint waitlist_rate_limits_attempts_positive check (attempt_count >= 0)
);

alter table public.waitlist_rate_limits enable row level security;
alter table public.waitlist_rate_limits force row level security;

revoke all on table public.waitlist_rate_limits from public, anon, authenticated;
grant all on table public.waitlist_rate_limits to service_role;

create or replace function public.join_animivo_waitlist(
  p_email text,
  p_full_name text,
  p_pet_type text,
  p_pet_name text default null,
  p_biggest_challenge text default null,
  p_consent boolean default false,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_referral_source text default null,
  p_landing_path text default null,
  p_referring_domain text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_email_normalized text;
  v_existing public.waitlist_signups%rowtype;
  v_position bigint;
  v_founding boolean;
  v_referral text;
  v_attempts integer := 0;
begin
  if p_consent is not true then
    raise exception 'consent required';
  end if;

  v_email_normalized := lower(btrim(p_email));

  perform pg_advisory_xact_lock(hashtextextended('animivo_waitlist_join', 0));

  select *
    into v_existing
    from public.waitlist_signups
   where email_normalized = v_email_normalized;

  if found then
    return jsonb_build_object(
      'outcome', 'already_joined',
      'founding_member', v_existing.founding_member
    );
  end if;

  select coalesce(max(waitlist_position), 0) + 1
    into v_position
    from public.waitlist_signups;

  v_founding := v_position <= 100;

  loop
    v_attempts := v_attempts + 1;
    v_referral := encode(extensions.gen_random_bytes(12), 'hex');

    begin
      insert into public.waitlist_signups (
        email,
        email_normalized,
        full_name,
        pet_type,
        pet_name,
        biggest_challenge,
        consent,
        consent_timestamp,
        founding_member,
        waitlist_position,
        referral_code,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        referral_source,
        landing_path,
        referring_domain,
        status
      ) values (
        btrim(p_email),
        v_email_normalized,
        btrim(p_full_name),
        p_pet_type,
        nullif(btrim(coalesce(p_pet_name, '')), ''),
        nullif(btrim(coalesce(p_biggest_challenge, '')), ''),
        true,
        now(),
        v_founding,
        v_position,
        v_referral,
        nullif(btrim(coalesce(p_utm_source, '')), ''),
        nullif(btrim(coalesce(p_utm_medium, '')), ''),
        nullif(btrim(coalesce(p_utm_campaign, '')), ''),
        nullif(btrim(coalesce(p_utm_content, '')), ''),
        nullif(btrim(coalesce(p_referral_source, '')), ''),
        nullif(btrim(coalesce(p_landing_path, '')), ''),
        nullif(btrim(coalesce(p_referring_domain, '')), ''),
        'waiting'
      );

      return jsonb_build_object(
        'outcome', 'joined',
        'founding_member', v_founding
      );
    exception
      when unique_violation then
        select *
          into v_existing
          from public.waitlist_signups
         where email_normalized = v_email_normalized;

        if found then
          return jsonb_build_object(
            'outcome', 'already_joined',
            'founding_member', v_existing.founding_member
          );
        end if;

        if v_attempts >= 5 then
          raise;
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.join_animivo_waitlist(
  text, text, text, text, text, boolean, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.join_animivo_waitlist(
  text, text, text, text, text, boolean, text, text, text, text, text, text, text
) to service_role;

create or replace function public.consume_waitlist_rate_limit(
  p_bucket_hash text,
  p_window_seconds integer,
  p_max_attempts integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_window timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_bucket_hash, 1));

  delete from public.waitlist_rate_limits
   where updated_at < v_now - interval '24 hours';

  insert into public.waitlist_rate_limits as rl (
    bucket_hash,
    window_started_at,
    attempt_count,
    updated_at
  ) values (
    p_bucket_hash,
    v_now,
    1,
    v_now
  )
  on conflict (bucket_hash) do update
    set
      attempt_count = case
        when rl.window_started_at > excluded.window_started_at - make_interval(secs => p_window_seconds)
          then rl.attempt_count + 1
        else 1
      end,
      window_started_at = case
        when rl.window_started_at > excluded.window_started_at - make_interval(secs => p_window_seconds)
          then rl.window_started_at
        else excluded.window_started_at
      end,
      updated_at = excluded.updated_at
  returning attempt_count, window_started_at into v_count, v_window;

  return v_count <= p_max_attempts;
end;
$$;

revoke all on function public.consume_waitlist_rate_limit(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.consume_waitlist_rate_limit(text, integer, integer)
  to service_role;
