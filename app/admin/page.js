import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

// The admin page remains a Server Component.
//
// Its responsibility is:
// 1. Check authentication.
// 2. Check the admin role.
// 3. Load analytics.
// 4. Load categories.
// 5. Pass the data to the interactive admin dashboard.
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