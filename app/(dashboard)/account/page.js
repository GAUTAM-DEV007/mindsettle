import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile, error }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, plans:subscription_plans(name, type)")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const isPaid = Boolean(subscription);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">
          My MindSettle
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#163d34]">Account</h1>
      </div>

      <div className="max-w-md rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-[#5a6d66]">Email</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere] sm:text-right font-medium text-[#163d34]">{user?.email}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-[#5a6d66]">Member since</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere] sm:text-right font-medium text-[#163d34]">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="max-w-md rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        <h2 className="text-lg font-bold text-[#163d34]">Membership</h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-[#5a6d66]">Membership type</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere] sm:text-right font-medium text-[#163d34]">{isPaid ? "Premium" : "Free"}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-[#5a6d66]">Current plan</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere] sm:text-right font-medium text-[#163d34]">{subscription?.plans?.name ?? "MindSettle Free"}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-[#5a6d66]">Subscription status</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere] sm:text-right font-medium capitalize text-[#163d34]">{subscription?.status ?? "None"}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center rounded-xl bg-[#dce8ca]/60 px-4 py-3">
          <p className="text-sm text-[#163d34]">
            {isPaid ? "Manage your plan and billing details." : "You're on a free account."}
          </p>
          <Link
            href={isPaid ? "/account/billing" : "/subscription"}
            className="shrink-0 rounded-full bg-[#163d34] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#12372f]"
          >
            {isPaid ? "Manage billing" : "Upgrade"}
          </Link>
        </div>
      </div>

      <div className="max-w-md rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        <h2 className="text-lg font-bold text-[#163d34]">Profile</h2>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-semibold text-[#163d34]">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              maxLength={100}
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your name"
              className="w-full min-w-0 rounded-lg border border-[#dfe5dc] px-3 py-2 text-sm text-[#29383e] outline-none focus:border-[#163d34]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="avatarUrl" className="text-sm font-semibold text-[#163d34]">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              maxLength={2048}
              defaultValue={profile?.avatar_url ?? ""}
              placeholder="https://..."
              className="w-full min-w-0 rounded-lg border border-[#dfe5dc] px-3 py-2 text-sm text-[#29383e] outline-none focus:border-[#163d34]"
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
