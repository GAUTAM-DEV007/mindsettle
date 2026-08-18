import { createAdminClient, isAdminApiConfigured, listAllAuthUsers } from "@/lib/supabase/admin";

// Focused fetch for the dedicated /admin-dashboard/subscriptions page --
// only what a subscriptions table needs (not the whole admin dashboard's
// stats/media/programs data). Requires SUPABASE_SERVICE_ROLE_KEY to see
// every user's row; returns an empty, clearly-flagged result otherwise
// rather than throwing.
export async function getAdminSubscriptionRecords() {
  if (!isAdminApiConfigured()) {
    return { configured: false, subscriptions: [] };
  }

  const supabase = createAdminClient();

  const [authUsers, { data: roleRows }, { data: subscriptionRows }, { data: planRows }] =
    await Promise.all([
      listAllAuthUsers(supabase),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("subscriptions")
        .select(
          "id, user_id, organisation_id, status, plan, plan_id, stripe_subscription_id, current_period_end, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase.from("subscription_plans").select("id, name, type, billing_cycle"),
    ]);

  const emailByUserId = new Map(authUsers.map((u) => [u.id, u.email]));
  const roleByUserId = new Map((roleRows ?? []).map((r) => [r.user_id, r.role]));
  const planById = new Map((planRows ?? []).map((p) => [p.id, p]));

  const subscriptions = (subscriptionRows ?? []).map((s) => {
    const plan = s.plan_id ? planById.get(s.plan_id) : null;

    return {
      id: s.id,
      email: emailByUserId.get(s.user_id) ?? "Unknown",
      plan: plan?.name ?? s.plan,
      planType:
        plan?.type ??
        (s.organisation_id || roleByUserId.get(s.user_id) === "organisation"
          ? "organisation"
          : "individual"),
      status: s.status,
      startDate: s.created_at,
      currentPeriodEnd: s.current_period_end,
      stripeSubscriptionId: s.stripe_subscription_id,
    };
  });

  return { configured: true, subscriptions };
}
