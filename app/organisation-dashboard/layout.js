import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrganisationSidebar from "@/components/layout/OrganisationSidebar";

// proxy.js already redirects non-organisation users away from
// /organisation-dashboard, but Next.js recommends re-checking auth inside
// the route itself rather than relying on proxy alone (a matcher change
// could silently drop coverage). Centralized here so every page under this
// layout (dashboard, members, programs, reports) is covered by one check
// instead of repeating it in each page.
export const dynamic = "force-dynamic";

export default async function OrganisationDashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "organisation") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <OrganisationSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
