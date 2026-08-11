import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

// This route is auth-gated and its data depends on the current admin session.
// Never statically render/cache it.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}) {
  const { categoryError } = await searchParams;

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
  // RENDER INTERACTIVE ADMIN DASHBOARD
  // --------------------------------------------------

  return (
    <AdminDashboardClient
      stats={stats}
      categories={categories || []}
      categoryError={
        categoryError || null
      }
    />
  );
}