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
      <h1 className="text-2xl font-semibold">Account</h1>

      <div className="max-w-md rounded-xl border border-neutral-200 p-6">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Member since</dt>
            <dd className="font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="max-w-md rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Membership</h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Membership type</dt>
            <dd className="font-medium">{isPaid ? "Premium" : "Free"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Current plan</dt>
            <dd className="font-medium">{subscription?.plans?.name ?? "MindSettle Free"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subscription status</dt>
            <dd className="font-medium capitalize">{subscription?.status ?? "None"}</dd>
          </div>
        </dl>

        {!isPaid && (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-800">You&apos;re on a free account.</p>
            <Link
              href="/subscription"
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Upgrade
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-md rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Profile</h2>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              maxLength={100}
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your name"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="avatarUrl" className="text-sm font-medium text-neutral-700">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              maxLength={2048}
              defaultValue={profile?.avatar_url ?? ""}
              placeholder="https://..."
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
