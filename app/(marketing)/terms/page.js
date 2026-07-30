import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 px-6 py-16 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            Legal information
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Mindsettle Terms of Service
          </h1>

          <p className="mt-4 text-base text-slate-600">
            Last updated: August 2026
          </p>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-12">
          <div className="rounded-2xl bg-sky-50 p-6 text-base leading-7 text-slate-700">
            These draft Terms of Service explain the conditions that apply when
            users and organisations access Mindsettle. They should be reviewed
            and approved by the client and an appropriate legal professional
            before production release.
          </div>

          <div className="mt-10 space-y-10 text-base leading-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                1. Agreement to These Terms
              </h2>

              <p className="mt-4">
                By creating an account, accessing or using Mindsettle, you agree
                to follow these Terms of Service. If you do not agree with these
                terms, you should not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                2. About Mindsettle
              </h2>

              <p className="mt-4">
                Mindsettle provides calming videos, mindfulness resources,
                ambient content and wellbeing tools for hospitals, clinics,
                aged-care facilities, organisations and authorised users.
              </p>

              <p className="mt-4">
                Mindsettle is a wellness platform and does not provide medical
                advice, diagnosis or treatment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                3. User Accounts
              </h2>

              <p className="mt-4">
                Users must provide accurate information when creating an
                account and must keep their login details secure.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Do not share your password with another person.</li>
                <li>Notify Mindsettle if you suspect unauthorised access.</li>
                <li>
                  You are responsible for activity performed through your
                  account.
                </li>
                <li>
                  Organisation administrators are responsible for managing
                  access within their organisation.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                4. Organisation Accounts
              </h2>

              <p className="mt-4">
                An organisation administrator may invite members, assign
                organisation-level roles and manage the organisation&apos;s
                subscription and access settings.
              </p>

              <p className="mt-4">
                Organisation administrators may only manage users and data
                associated with their own organisation. They may not access
                another organisation&apos;s records or the Mindsettle system
                administration area.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                5. Acceptable Use
              </h2>

              <p className="mt-4">
                Users must use Mindsettle lawfully and responsibly.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Do not upload illegal, harmful or unauthorised content.</li>
                <li>Do not attempt to bypass security controls.</li>
                <li>
                  Do not interfere with the operation or availability of the
                  platform.
                </li>
                <li>
                  Do not copy, redistribute or misuse protected platform
                  content.
                </li>
                <li>
                  Follow any relevant workplace, clinical and organisational
                  policies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                6. Subscriptions and Payments
              </h2>

              <p className="mt-4">
                Some Mindsettle features may require a paid subscription.
                Pricing, billing periods, included features and cancellation
                conditions will be shown before a subscription is confirmed.
              </p>

              <p className="mt-4">
                Cancellation will not normally result in an immediate loss of
                access. Access may continue until the end of the current paid
                billing period, subject to the selected plan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                7. Intellectual Property
              </h2>

              <p className="mt-4">
                The Mindsettle name, logo, software, interface, videos,
                graphics, written content and other materials remain the
                property of Mindsettle or the relevant content owner unless
                otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                8. Privacy
              </h2>

              <p className="mt-4">
                The collection and handling of personal information is
                described in the{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                9. Availability and Changes
              </h2>

              <p className="mt-4">
                Mindsettle may update, improve, suspend or change parts of the
                platform when reasonably necessary. Planned maintenance may
                occasionally affect availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                10. Suspension or Termination
              </h2>

              <p className="mt-4">
                Mindsettle may suspend or terminate access where an account
                breaches these terms, creates a security risk, misuses the
                service or fails to meet payment obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                11. Disclaimer
              </h2>

              <p className="mt-4">
                Mindsettle provides general wellness and relaxation content. It
                is not a substitute for professional medical advice, diagnosis,
                treatment, emergency services or clinical care.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                12. Contact
              </h2>

              <p className="mt-4">
                Questions about these Terms of Service can be submitted through
                the{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900"
                >
                  Contact page
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Draft notice: This document is provided for project development and
            client review. It is not final legal advice.
          </div>
        </article>
      </div>
    </main>
  );
}