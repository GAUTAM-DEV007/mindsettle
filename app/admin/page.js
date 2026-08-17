import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isAdminApiConfigured,
  createAdminClient,
  listAllAuthUsers,
} from "@/lib/supabase/admin";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

// This route is auth-gated and its data depends on the current admin session.
// Never statically render/cache it.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}) {
  const { categoryError, usersError, subscriptionsError, invoicesError } =
    await searchParams;

  const supabase = await createClient();

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  // --------------------------------------------------
  // ADMIN ROLE CHECK
  // --------------------------------------------------

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    roleError ||
    roleRecord?.role !== "admin"
  ) {
    redirect("/");
  }

  // --------------------------------------------------
  // LOAD ADMIN DASHBOARD DATA
  // --------------------------------------------------

  const [
    {
      data: stats,
      error: statsError,
    },
    {
      data: categories,
      error: categoriesError,
    },
  ] = await Promise.all([
    supabase.rpc(
      "admin_dashboard_analytics"
    ),

    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name"),
  ]);

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  if (statsError) {
    console.error(
      "Admin analytics error:",
      statsError
    );

    throw new Error(
      statsError.message
    );
  }

  if (categoriesError) {
    console.error(
      "Admin categories error:",
      categoriesError
    );

    throw new Error(
      categoriesError.message
    );
  }

  // --------------------------------------------------
  // LOAD USERS / SUBSCRIPTIONS / INVOICES (service role)
  // --------------------------------------------------
  // Needs SUPABASE_SERVICE_ROLE_KEY to bypass RLS (list every user's rows,
  // not just the admin's own) and to call the Admin API. Guarded so a
  // missing key shows an empty state instead of crashing this page.

  const adminApiConfigured = isAdminApiConfigured();
  let users = [];
  let subscriptions = [];
  let invoices = [];

  if (adminApiConfigured) {
    try {
      const adminSupabase = createAdminClient();

      const [
        authUsers,
        { data: roleRows },
        { data: subscriptionRows },
        { data: invoiceRows },
      ] = await Promise.all([
        listAllAuthUsers(adminSupabase),
        adminSupabase.from("user_roles").select("user_id, role"),
        adminSupabase
          .from("subscriptions")
          .select(
            "id, user_id, status, plan, stripe_subscription_id, current_period_end"
          )
          .order("created_at", { ascending: false }),
        adminSupabase
          .from("invoices")
          .select(
            "id, user_id, amount_due, currency, status, hosted_invoice_url, invoice_pdf, email_sent_at, created_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      const emailByUserId = new Map(authUsers.map((u) => [u.id, u.email]));
      const roleByUserId = new Map(
        (roleRows ?? []).map((r) => [r.user_id, r.role])
      );

      users = authUsers
        .map((u) => ({
          id: u.id,
          email: u.email,
          role: roleByUserId.get(u.id) ?? "user",
          createdAt: u.created_at,
          suspended:
            Boolean(u.banned_until) && new Date(u.banned_until) > new Date(),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      subscriptions = (subscriptionRows ?? []).map((s) => ({
        id: s.id,
        email: emailByUserId.get(s.user_id) ?? "Unknown",
        status: s.status,
        plan: s.plan,
        stripeSubscriptionId: s.stripe_subscription_id,
        currentPeriodEnd: s.current_period_end,
      }));

      invoices = (invoiceRows ?? []).map((i) => ({
        id: i.id,
        email: emailByUserId.get(i.user_id) ?? "Unknown",
        amountDue: i.amount_due,
        currency: i.currency,
        status: i.status,
        hostedInvoiceUrl: i.hosted_invoice_url,
        invoicePdf: i.invoice_pdf,
        emailSentAt: i.email_sent_at,
        createdAt: i.created_at,
      }));
    } catch (err) {
      // e.g. the invoices migration hasn't been run yet -- don't take the
      // whole admin dashboard down over it, just show empty sections.
      console.error("Admin billing data error:", err);
    }
  }

  // --------------------------------------------------
  // RENDER INTERACTIVE ADMIN DASHBOARD
  // --------------------------------------------------

  return (
    <AdminDashboardClient
      stats={stats}
      categories={categories || []}
      categoryError={
        categoryError || null
      }
      users={users}
      subscriptions={subscriptions}
      invoices={invoices}
      adminApiConfigured={adminApiConfigured}
      usersError={usersError || null}
      subscriptionsError={subscriptionsError || null}
      invoicesError={invoicesError || null}
    />
  );
}