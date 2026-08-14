import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

// Every route under this layout is per-user (auth-gated);
// never statically render/cache it.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <DashboardNavbar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-8 lg:px-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}