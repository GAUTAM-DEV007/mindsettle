import Link from "next/link";
import OrganisationRegistrationForm from "@/components/auth/OrganisationRegistrationForm";

export default function OrganisationRegisterPage() {
  return (
    <div className="w-full max-w-6xl">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#78906f]">MindSettle for organisations</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#163d34] sm:text-5xl">
          Give your people a calmer place to reset.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5a6d66] sm:text-base">
          Create a dedicated organisation-admin account, choose the number of member accounts you need, and receive automatic volume discounts as your team grows.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Feature title="Choose your seats" text="Pay for the member accounts your organisation needs." />
        <Feature title="Invite your people" text="Your organisation admin adds and removes members securely." />
        <Feature title="Manage in one place" text="Track active members, pending invites, and remaining seats." />
      </div>

      <OrganisationRegistrationForm />

      <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-5 text-neutral-500">
        By registering, you agree to the{" "}
        <Link href="/terms" className="underline hover:text-emerald-800">
          Terms of Use
        </Link>{" "}
        and acknowledge the{" "}
        <Link href="/privacy" className="underline hover:text-emerald-800">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-5 text-center text-sm text-neutral-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-emerald-700">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl border border-[#dfe5dc] bg-white/65 px-5 py-4">
      <p className="text-sm font-semibold text-[#163d34]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#6a7d75]">{text}</p>
    </div>
  );
}
