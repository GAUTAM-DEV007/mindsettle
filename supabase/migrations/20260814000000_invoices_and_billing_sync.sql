-- Invoice tracking + Stripe sync support.
-- Run in the Supabase SQL Editor after database-schema.sql.
-- Safe to re-run: every statement is idempotent.

-- Stripe subscription ids are already stored on `subscriptions`, but there
-- was no uniqueness guarantee, so the webhook's upsert (onConflict:
-- "stripe_subscription_id") had nothing to conflict on. A unique index
-- (not a unique column constraint, so this works idempotently pre-PG15)
-- fixes that. NULLs remain distinct, so existing rows without a Stripe id
-- are unaffected.
create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id);

-- Written by the Stripe webhook (service role) and read by the admin
-- invoice-management UI. Not writable by end users.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  stripe_invoice_id text unique,
  stripe_customer_id text,
  amount_due integer not null default 0,
  amount_paid integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  hosted_invoice_url text,
  invoice_pdf text,
  period_start timestamptz,
  period_end timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);

alter table public.invoices enable row level security;

-- Same pattern as subscriptions: users read their own invoices only. All
-- writes happen server-side -- the Stripe webhook (service role) creates/
-- updates rows, and the admin "send invoice" action (service role) sets
-- email_sent_at. No insert/update/delete policy for regular users.
drop policy if exists "Users can view their own invoices" on public.invoices;
create policy "Users can view their own invoices"
  on public.invoices
  for select
  using (auth.uid() = user_id);
