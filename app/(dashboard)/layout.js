import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

// Every route under this layout is per-user (auth-gated); never
// statically render/cache it.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
