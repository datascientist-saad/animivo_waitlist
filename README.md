# Animivo Founding 100 Waitlist

A standalone waitlist site for Animivo’s first 100 early users. It is a separate project from the main Animivo app and can be deployed on its own Vercel project.

The page explains Animivo in the first viewport, captures consenting signups in Supabase, and records campaign attribution for Reddit and other community posts. It does not replace veterinary advice.

## 1. Local setup

Required Node.js: **20.9 or newer** (Node 22 is fine).

```bash
git clone <this-repo>
cd animivo-waitlist
npm install
cp .env.example .env.local
```

Fill `.env.local` using the sections below, then:

```bash
npm run dev
```

The app listens on [http://127.0.0.1:43123](http://127.0.0.1:43123).

## 2. Required Node version

- `package.json` engines: `>=20.9.0`
- Developed against Node 22

## 3. Create a Supabase project

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (this waitlist should not share the main Animivo database unless you intentionally choose to).
2. Copy **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy **service_role** (secret) into `SUPABASE_SERVICE_ROLE_KEY`.
4. Do not put the service-role key in any `NEXT_PUBLIC_` variable.
5. You do not need the `anon` key in this app. The browser never talks to Supabase.

## 4. Run the SQL migration

In the Supabase SQL editor, paste and run:

`supabase/migrations/001_create_waitlist.sql`

Or with the CLI:

```bash
npx supabase db push
```

Confirm:

- Table `waitlist_signups` exists
- RLS is enabled and there are **no** policies for `anon` / `authenticated`
- Function `join_animivo_waitlist` is executable only by `service_role`

## 5. Create Cloudflare Turnstile keys

1. Open [https://dash.cloudflare.com/](https://dash.cloudflare.com/) → Turnstile
2. Add a site (widget type: managed)
3. Add your local origin (`http://127.0.0.1:43123`) and your production domain
4. Copy the site key to `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Copy the secret key to `TURNSTILE_SECRET_KEY`

Local-only bypass (never used in production):

```env
ALLOW_DEV_TURNSTILE_BYPASS=true
```

The bypass accepts the token `dev-bypass` only when `NODE_ENV` is not `production`. Production ignores it.

## 6. Configure rate limiting

Preferred: [Upstash Redis](https://upstash.com/)

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Fallback: if those variables are empty, the API uses `waitlist_rate_limits` in Supabase via `consume_waitlist_rate_limit` (service role only).

Limits:

- 5 attempts per 10 minutes per hashed IP
- 3 attempts per hour per hashed email

IPs are HMAC-SHA256 hashed with `RATE_LIMIT_HASH_SECRET`. Raw IPs are not stored.

**Hosting assumption:** `x-forwarded-for` is trusted only when Vercel sets `VERCEL=1`. Outside Vercel, forwarded IPs are treated as untrusted.

## 7. Local environment variables

See `.env.example`. A complete `.env.local` looks like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret
RATE_LIMIT_HASH_SECRET=a-long-random-string-at-least-16-chars
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:43123
NEXT_PUBLIC_ENABLE_ANALYTICS=false
ANIMIVO_CONTACT_EMAIL=hello@animivo.app
ALLOW_DEV_TURNSTILE_BYPASS=true
```

Generate `RATE_LIMIT_HASH_SECRET` with:

```bash
openssl rand -hex 32
```

## 8. Vercel environment variables

In the Vercel project → Settings → Environment Variables, set the same keys for Production (and Preview if you want preview signups).

Production notes:

- `NEXT_PUBLIC_SITE_URL` must be the public HTTPS origin, e.g. `https://waitlist.animivo.app`
- `ALLOW_DEV_TURNSTILE_BYPASS=false`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true` only if you want Vercel Web Analytics

## 9. Run tests

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify:secrets
```

`verify:secrets` scans `.next/static` to confirm server secret **names** are not in the client bundle.

## 10. Deploy to Vercel

1. Push this repository.
2. In Vercel, **Add New Project** and import this repo (do not attach it to the existing Animivo app).
3. Framework preset: Next.js. Install command: `npm install`. Build: `npm run build`.
4. Add environment variables from section 8.
5. Deploy.
6. Add the production domain to Turnstile allowed origins.

## 11. Viewing and exporting signups

There is **no** public admin page and **no** list/export API.

In the Supabase Table Editor, open `waitlist_signups`.

Useful filters:

- Founding 100: `founding_member = true`
- Reddit campaign: `utm_source = reddit`
- Referral source: `referral_source = petowners` (or `catcare`, `birdowners`)
- Status: `waiting`, `invited`, `onboarded`, `unsubscribed`, `deleted`

Export CSV from the table menu.

To invite someone: set `status` to `invited`, then `onboarded` after they create an Animivo account.

To honor a deletion request: delete the row (or set `status` to `deleted` and clear personal fields if you prefer a tombstone). Confirm the request from the same email address.

## 12. Rotating compromised secrets

If a secret leaks:

1. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase and update Vercel.
2. Rotate Turnstile keys and update both Turnstile env vars.
3. Rotate `RATE_LIMIT_HASH_SECRET` (existing rate-limit buckets will reset).
4. Rotate Upstash tokens if used.
5. Redeploy. Old deployments keep old env until they are replaced.

## 13. Custom domain

1. In Vercel, add the domain (for example `waitlist.animivo.app`).
2. Point DNS as Vercel instructs.
3. Set `NEXT_PUBLIC_SITE_URL` to that `https://` origin.
4. Add the domain to Turnstile.
5. Redeploy so canonical URLs and origin checks pick up the new host.

A dedicated Open Graph image (about 1200×630) is still recommended. The hero photograph is 3:2 and is **not** used as `og:image`, because a 1.91:1 crop would cut the animals awkwardly.

## 14. Suggested Reddit UTM links

Replace the host with your production domain:

```text
https://waitlist.example.com/?utm_source=reddit
https://waitlist.example.com/?utm_source=reddit&utm_medium=community&utm_campaign=founding100
https://waitlist.example.com/?ref=petowners
https://waitlist.example.com/?ref=catcare
https://waitlist.example.com/?ref=birdowners
https://waitlist.example.com/?utm_source=reddit&utm_medium=community&utm_campaign=founding100&utm_content=r-dogs&ref=petowners
```

Facebook groups:

```text
https://waitlist.example.com/?utm_source=facebook&utm_medium=group&utm_campaign=founding100
```

## Architecture notes

- Submissions go only to `POST /api/waitlist`.
- PostgreSQL function `join_animivo_waitlist` assigns waitlist position under a transaction advisory lock. Positions 1–100 receive `founding_member = true`.
- Duplicate emails return the same HTTP 200 shape with `outcome: "already_joined"`.
- The public site never selects from `waitlist_signups`.
