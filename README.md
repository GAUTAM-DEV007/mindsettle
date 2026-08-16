# Mindsettle

Mindsettle is a Next.js application for calming clinical environments through nature imagery, soundscapes, guided wellbeing content and organisation-managed access.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm
- A Supabase project

Copy `.env.example` to `.env.local` and replace the placeholders with the URL and anonymous key from your Supabase project settings.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database and authentication

Apply the migrations in `supabase/migrations` in filename order. With the Supabase CLI linked to the intended project:

```bash
supabase db push
```

The migrations create the content, profile, membership and subscription tables; signup triggers; admin analytics function; private media bucket; and row-level security policies.

Supabase Authentication should have email/password enabled. Add these redirect URLs in the Supabase dashboard for each environment:

- `http://localhost:3000/auth/callback`
- `https://your-production-domain/auth/callback`

New accounts receive the `user` role. Organisation registration can request only the `organisation` role. Admin access must be granted manually by a trusted database operator:

```sql
update public.user_roles
set role = 'admin'
where user_id = '<trusted-user-uuid>';
```

Never expose the Supabase service-role key in a `NEXT_PUBLIC_` variable.

## Media

Media is stored in the private `videos` bucket. Admin users can upload and manage files; signed-in members can create signed URLs only for files connected to published content. The resumable uploader supports files up to 5 GB, subject to the Supabase project plan.

## Billing

The billing page displays real rows from `subscriptions`. The webhook deliberately returns `503` until a payment provider, signing secret and verified event handler are configured. Do not point a live Stripe webhook at it until that integration is complete.

## Checks

Run these before publishing:

```bash
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

## Production

Set the two public Supabase variables in the host, apply the database migrations to the production project, configure the production auth callback URL, and run `npm run build`. HTTPS should be required in production.
