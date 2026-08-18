import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getAdminSubscriptionRecords } from "@/lib/admin/subscriptions";
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";

// Auth-gated, per-request data -- never statically render/cache this route.
export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  // Redirects unauthenticated visitors to /login, and any authenticated
  // non-admin (user or organisation) back to their own dashboard rather
  // than this one.
  await requireRole("admin");

  const { configured, subscriptions } = await getAdminSubscriptionRecords();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#163d34]">
            Subscription records
          </h1>
          <p className="mt-1 text-neutral-600">
            Every individual and organisation subscription on MindSettle.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-emerald-700">
          Full admin dashboard →
        </Link>
      </div>

      <SubscriptionManagement
        subscriptions={subscriptions}
        configured={configured}
        showFilters
      />
    </div>
  );
}
