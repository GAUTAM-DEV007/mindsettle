# Mindsettle

Mindsettle is a Next.js application for calming clinical environments through nature imagery, soundscapes, guided wellbeing content and organisation-managed access.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm
- A Supabase project

Copy `.env.example` to `.env.local` and replace the placeholders. The public Supabase URL and anonymous key enable basic sign-in. Organisation member creation, billing, and invitation emails also need the server-only credentials listed in that file. Never commit real credentials.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database and authentication

For a **brand-new empty project**, first apply `database-schema.sql`, then all migrations in `supabase/migrations` in filename order. The early invoice migration depends on the base schema, so migrations alone do not bootstrap an empty database. Keep the new project private until all hardening migrations are applied.

For an **existing project**, take a backup and reconcile its actual schema and migration history before using the CLI. Do not rerun the legacy base schema over an existing project: it can restore old policies. Once migration history is reconciled and the CLI is linked to the intended project:

```bash
supabase db push
```

The migrations create the content, profile, membership and subscription tables; signup triggers; admin analytics function; private media bucket; and row-level security policies.

Supabase Authentication should have email/password, Google, and Apple enabled. Facebook is intentionally not offered. Add these redirect URLs in the Supabase dashboard for each environment:

- `http://localhost:3000/auth/callback`
- `https://your-production-domain/auth/callback`

Google and Apple must both use Supabase's provider callback URL in their respective developer consoles:

- `https://<your-project-ref>.supabase.co/auth/v1/callback`

Google requires an OAuth web client ID and secret. Apple requires a Services ID and OAuth secret; Apple secrets expire and must be renewed. The sign-in buttons check the public provider settings and display an explanation while a provider is disabled or unavailable.

New accounts receive the `user` role. Organisation registration can request only the `organisation` role. Admin access must be granted manually by a trusted database operator:

```sql
update public.user_roles
set role = 'admin'
where user_id = '<trusted-user-uuid>';
```

Never expose the Supabase service-role key in a `NEXT_PUBLIC_` variable.

## Media

Media is stored in the private `videos` bucket. Storage policies enforce paid tiers and immutable free-video claims; the app does not rely on a browser counter. Unpaid users can claim three distinct free sessions and replay those sessions. Browsing and hovering do not consume claims. Temporary-password users must finish onboarding first. Apply `20260831000000_security_and_playback_hardening.sql` before deploying this version; free playback deliberately fails closed without it.

The resumable uploader supports files up to 5 GB, subject to the Supabase project plan. Cleanup checks for saved references before removing failed uploads. Optional MEGA archiving is not required for playback and should stay disabled until its memory/runtime requirements have been tested on the host.

## Billing

The billing page displays real rows from `subscriptions`. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, each active plan's Stripe Price ID, and Stripe's customer portal. The signed webhook at `/api/webhooks/subscription` syncs subscription and invoice events; it returns `503` if server credentials are missing. A checkout return URL alone never grants access.

Organisation checkout uses a monthly USD graduated price: seats 1–20 cost $9.95 each, 21–50 $6.67 each, 51–100 $6.00 each, and 101+ $5.50 each. The selected member seats do not include the organisation-admin account. The database serialises seat reservations to prevent concurrent over-allocation.

The individual trial lasts one day, with cancellation if no payment method is supplied. Customers can open the billing portal for payment details and invoices. In-app cancellation ends access immediately and requires confirmation. Plan/seat changes currently go through support; disable subscription-update features in the Stripe portal until those changes have been tested against seat allocations.

## Checks

Run these before publishing:

```bash
npm run check
npm audit --omit=dev --audit-level=high
```

## Production

`npm run check` runs the regression tests, ESLint, and production build. It does not prove that live payment/email/OAuth services are configured or that database policies have been applied. The audit command contacts npm and sends dependency metadata.

See [the release checklist](docs/RELEASE-CHECKLIST.md) for current blockers, deployment order, and end-to-end acceptance tests. Production requires an HTTPS `NEXT_PUBLIC_SITE_URL`, all applicable server credentials, verified auth callbacks, tested database migrations, backups, and working provider services. Do not deploy this branch as production-ready until the checklist is complete.
