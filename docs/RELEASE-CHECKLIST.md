# Release readiness — 31 August 2026

This is a code audit and repair pass, not a guarantee that the site has no vulnerabilities. The changes are local; no production database migration, payment, email, account deletion, or OAuth configuration was performed in this pass.

## Completed in code

- Safe local login redirects, refreshed-session cookies preserved on redirects, role checks at protected operations, and mandatory first-password setup.
- Google/Apple sign-in and signup controls; Facebook removed from authentication. Provider failures no longer leave the controls stuck. Facebook marketing links remain intentional.
- Organisation portal, seat selection/pricing, atomic member-seat reservation, temporary-password onboarding and privacy-safe access reporting.
- Free-session claims enforced atomically in SQL and Storage RLS; hover/list prefetch does not claim sessions. Failed permission lookups do not grant access.
- Subscription period checks, legacy 50-seat package preservation, current Stripe subscription/invoice event shapes, explicit no-card trial cancellation, payment-details portal entry point and cancellation confirmation.
- Security headers, server-only credential boundaries, error/404 screens, honest missing-service messages and safe failed-upload cleanup.
- Account deletion is blocked while a non-cancelled Stripe subscription is recorded, avoiding deletion of billing references while charges continue.
- Regression tests covering redirects, pricing, entitlements, OAuth provider status and upload cleanup.

## Must be completed before release

### 1. Database and backups

Live preflight on 31 August 2026: the user approved the three updates, but execution was paused because Supabase explicitly reports that this Free-plan project has no managed backups. No schema, access policy or application data was changed. A read-only SQL query confirmed 3 subscription rows, 0 organisation member rows, no duplicate member-email groups, no unexpected member statuses and no invalid legacy seat limits. The seat column, onboarding columns, reservation function and free-claim table are all still absent. A recent manual backup must be confirmed or created before resuming.

The last live inspection of Supabase project `hohrsbvpjohlwlbhvgao` found no recorded migration history and missing organisation-seat/onboarding columns. The dashboard also showed a quota warning. Do not blindly run all historical migrations against this existing project.

Take and verify a backup, confirm the correct project, inspect for case-insensitive duplicate organisation emails, and review/apply these pending migrations in order:

1. `20260826000000_organisation_seat_subscriptions.sql`: adds purchased quantities, backfills legacy seat packages, creates the flexible plan and stops offering legacy packages to new customers.
2. `20260828000000_organisation_member_onboarding.sql`: adds onboarding state and atomic seat reservations; restricts direct member writes.
3. `20260831000000_security_and_playback_hardening.sql`: creates immutable free-session claims, tightens entitlement/storage policies, and removes public access to trigger-only functions.

These migrations change live access policies and require explicit approval before execution. They have been reviewed locally but not executed against a database in this pass. Deploy them before the dependent application code. Without them, organisation pages display a service warning and unpaid playback is intentionally unavailable.

For a fresh empty environment, follow the README base-schema bootstrap instructions first. Never reapply the legacy base schema after hardening migrations.

Re-run Supabase Security Advisor after migration. Retain authenticated access to the role-checked analytics and entitlement RPCs. Review leaked-password protection, auth rate limits/CAPTCHA, quota restrictions, backup retention and recovery procedures.

### 2. Server environment

Only the two public Supabase variables were present in `.env.local` during inspection. Configure the following privately in the deployment host; do not paste secrets into chat or commit them:

- `NEXT_PUBLIC_SITE_URL`: the actual HTTPS production origin.
- `SUPABASE_SERVICE_ROLE_KEY`: needed for member account creation, onboarding completion, billing sync and trusted admin operations.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- `RESEND_API_KEY` and a verified-domain `RESEND_FROM_EMAIL`.

Restart the application after changing environment variables. Use separate test/live credentials and projects where possible.

### 3. Google, Apple and email

At the last live dashboard inspection, Google and Apple were disabled and had no credentials. Code alone cannot activate them.

- Configure Google OAuth web client credentials and Apple Services ID/signing secret in Supabase. Provider callback: `https://hohrsbvpjohlwlbhvgao.supabase.co/auth/v1/callback`.
- Set Supabase Site URL to the production origin and allow the application's `/auth/callback` URL for each environment. Test confirmation and password-reset callback URLs, including their `redirectTo` values.
- Test signup, subsequent sign-in, sign-out, email confirmation, reset-link expiry and cancelled OAuth flows. Provider consent/account choice may still be required; “one tap” cannot bypass provider security.
- Configure reliable Supabase SMTP for confirmation/reset mail and Resend for organisation welcome messages. Test delivery and spam folders with accounts you control.
- Temporary passwords are shown to the organisation admin if email delivery fails; they must be shared securely and changed on first login. Existing users retain their own passwords.

References: [Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google), [Apple setup](https://supabase.com/docs/guides/auth/social-login/auth-apple), [public Auth settings](https://github.com/supabase/auth#api).

### 4. Billing

- Create test-mode prices first and connect their IDs in Plan Management.
- Flexible organisation price must use monthly USD **graduated**, not volume, tiers matching `lib/billing/organisation-pricing.js`. Expected totals: 20 seats $199; 50 seats $399.10; 100 seats $699.10.
- Configure the webhook for `customer.subscription.created`, `.updated`, `.deleted`, and `invoice.created`, `.finalized`, `.paid`, `.payment_failed`. Confirm invalid signatures are rejected, retries are safe and delivery failures are visible.
- Enable Stripe's customer portal for payment details and invoice history. Keep plan/quantity changes disabled there until a safe seat-change workflow is implemented and tested. Existing plan/seat changes currently require support.
- Test the one-day trial, adding a card before expiry, no-card cancellation, renewal, failed payment, cancellation and delayed/out-of-order webhooks. Use Stripe test data, not real charges.
- Seat and access changes require verified Stripe/database state; do not grant a package merely because a browser returns to `?checkout=success`.

Reference: [Stripe trial end behavior](https://docs.stripe.com/billing/subscriptions/trials).

### 5. End-to-end acceptance

- Organisation admin reaches its own portal; member reaches the user dashboard; neither can access another organisation or platform admin operations.
- For a 50-seat test organisation, 50 concurrent/serial reservations succeed and the 51st fails; deleting a membership frees a seat.
- New member receives credentials, must reset the temporary password, then gains access. Test recovery after a partial onboarding failure.
- Existing members keep their password. Removing membership removes organisation entitlement while preserving independent purchases.
- Free user can claim three distinct sessions, replay them, but cannot claim a fourth—even through direct database/storage API calls or concurrent requests. Changing/deleting watch history must not restore the quota.
- Paid user has the correct tier; expired/cancelled plans and temporary-password accounts cannot create new protected signed URLs. Previously issued signed URLs remain valid until their expiry.
- Upload valid video/audio/image files, reject disallowed files, confirm unpublished media is not accessible, and verify failed retries do not remove saved content.
- Check desktop/mobile layout, keyboard focus, form errors, loading states and actual playback in a browser.

The contact form currently opens the visitor's mail application; it is not a server-delivered contact ticket. Confirm that this workflow is acceptable or separately implement a rate-limited contact service.

## Verification limits in this pass

- Final `npm run check`: 22 regression tests passed, ESLint passed, and the production build passed. Git whitespace checks passed. Local HTTP checks returned 200 for public pages, 404 for missing pages, redirects for protected pages, 401 for unauthenticated media administration and 400 for unsigned webhooks.
- Local browser automation was denied by browser URL policy, so this is not a visual/mobile interaction certification. No alternate browser was used to bypass that restriction.
- The current dependency audit could not complete. The first npm request failed and an elevated retry was blocked because it sends dependency metadata to npm. It is not a clean current vulnerability report; explicit approval is needed for that disclosure before retrying.
- Live Google/Apple authorization, email delivery, payment lifecycles, tenant isolation and the new SQL migrations still need the controlled tests above. No external secrets were added to the repository.
