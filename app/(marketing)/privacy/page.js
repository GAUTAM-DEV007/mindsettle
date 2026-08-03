import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 px-6 py-16 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            Your information matters
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Mindsettle Privacy Policy
          </h1>

          <p className="mt-4 text-base text-slate-600">
            Last updated: August 2026
          </p>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-12">
          <div className="rounded-2xl bg-emerald-50 p-6 text-base leading-7 text-slate-700">
            This draft Privacy Policy explains how Mindsettle may collect, use,
            store and protect personal information. It should be reviewed and
            approved by the client and an appropriate privacy or legal
            professional before production release.
          </div>

          <div className="mt-10 space-y-10 text-base leading-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                1. Information We May Collect
              </h2>

              <p className="mt-4">
                The information collected depends on how a person or
                organisation uses Mindsettle.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Name and contact details.</li>
                <li>Email address and account details.</li>
                <li>Organisation or facility information.</li>
                <li>Role and access permissions.</li>
                <li>Subscription and billing information.</li>
                <li>Account settings and preferences.</li>
                <li>Content activity and usage information.</li>
                <li>Mood entries, journal entries or wellbeing data entered by the user.</li>
                <li>Technical information such as browser and device data.</li>
                <li>Messages submitted through contact or feedback forms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                2. How We Use Information
              </h2>

              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Create and manage accounts.</li>
                <li>Authenticate users and protect account security.</li>
                <li>Provide access to videos, programs and platform features.</li>
                <li>Manage organisation members and permissions.</li>
                <li>Process and manage subscriptions.</li>
                <li>Provide support and respond to enquiries.</li>
                <li>Generate authorised usage reports and analytics.</li>
                <li>Improve performance, accessibility and user experience.</li>
                <li>Detect misuse, fraud or security incidents.</li>
                <li>Meet applicable legal and regulatory obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                3. Wellness and Sensitive Information
              </h2>

              <p className="mt-4">
                Some Mindsettle features may allow users to enter mood,
                journaling or other wellbeing information. This information may
                be sensitive and should only be collected when necessary and
                with clear user consent.
              </p>

              <p className="mt-4">
                The client should confirm exactly which wellbeing information
                will be collected, who may access it and how long it will be
                retained before the platform goes live.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                4. Organisation Access
              </h2>

              <p className="mt-4">
                Organisation administrators may manage members, roles and
                organisation-level access. Their access should be limited to
                records belonging to their own organisation.
              </p>

              <p className="mt-4">
                Normal organisation members should only see information and
                content permitted by their assigned role.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                5. Data Storage and Service Providers
              </h2>

              <p className="mt-4">
                Mindsettle may use trusted third-party providers to deliver the
                platform. This currently includes Supabase for authentication,
                database and storage services.
              </p>

              <p className="mt-4">
                Other providers may later be used for hosting, email,
                monitoring, video delivery or payments. The final policy should
                identify material service providers used in production.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                6. Data Security
              </h2>

              <p className="mt-4">
                Reasonable technical and organisational measures should be used
                to protect information against unauthorised access, alteration,
                loss, misuse or disclosure.
              </p>

              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Secure authentication.</li>
                <li>Role-based access control.</li>
                <li>Supabase Row Level Security policies.</li>
                <li>Encrypted network connections.</li>
                <li>Restricted administration access.</li>
                <li>Appropriate backups and security monitoring.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                7. Sharing of Information
              </h2>

              <p className="mt-4">
                Mindsettle should not sell personal information. Information
                may be shared only where needed to provide the service, comply
                with the law, protect users or meet contractual obligations.
              </p>

              <p className="mt-4">
                Organisation data should not be disclosed to another
                organisation without proper authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                8. Data Retention
              </h2>

              <p className="mt-4">
                Personal information should only be retained for as long as it
                is reasonably required for the purpose it was collected,
                applicable legal obligations, account management or legitimate
                business needs.
              </p>

              <p className="mt-4">
                The client should approve specific retention periods before
                launch.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                9. Access, Correction and Deletion
              </h2>

              <p className="mt-4">
                Users may request access to or correction of their personal
                information. They may also request account deletion where
                permitted by law and subject to legitimate retention
                requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                10. Cookies and Similar Technologies
              </h2>

              <p className="mt-4">
                Mindsettle may use essential cookies or local browser storage
                to maintain authentication, preferences and platform security.
                Any analytics or optional cookies should be described clearly
                before production release.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                11. Changes to This Policy
              </h2>

              <p className="mt-4">
                This Privacy Policy may be updated when platform features,
                service providers or legal obligations change. The latest
                version should always display its update date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">
                12. Contact
              </h2>

              <p className="mt-4">
                Privacy questions, account-access requests or deletion requests
                can be submitted through the{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900"
                >
                  Contact page
                </Link>
                .
              </p>

              <p className="mt-4">
                You can also review the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
                >
                  Terms of Service
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