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

  const organisationName =
    user.user_metadata?.organisation_name || "Your organisation";

  return (
    <div className="min-h-screen bg-[#f5f6ef] text-[#29383e] lg:flex">
      <OrganisationSidebar
        organisationName={organisationName}
        email={user.email}
      />
      <main className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute -right-36 top-16 h-80 w-80 rounded-full bg-[#dce8ca]/35 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-[38rem] h-72 w-72 rounded-full bg-[#d9e8e1]/35 blur-3xl" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
