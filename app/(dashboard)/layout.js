import { redirect } from "next/navigation";

import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";

import { createClient } from "@/lib/supabase/server";

// Every route under this layout is per-user (auth-gated);
// never statically render/cache it.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  modal,
}) {
  const supabase =
    await createClient();

  /* ======================================================
     AUTHENTICATION
  ====================================================== */

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ======================================================
     SOCIAL LINKS

     These come directly from Admin → Supabase.

     Only enabled links with a saved URL are loaded.
  ====================================================== */

  const {
    data: socialLinks,
    error: socialLinksError,
  } =
    await supabase
      .from("social_links")
      .select(
        `
        id,
        platform,
        url,
        is_enabled,
        sort_order
        `
      )
      .eq(
        "is_enabled",
        true
      )
      .not(
        "url",
        "is",
        null
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

  if (socialLinksError) {
    console.error(
      "Could not load dashboard social links:",
      socialLinksError
    );
  }

  /* ======================================================
     PAGE
  ====================================================== */

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f5f5ed] text-[#29383e]">
      {/* GLOBAL DASHBOARD BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed -left-32 top-28 -z-10 h-[380px] w-[380px] rounded-full bg-[#dce8ca]/25 blur-3xl" />

      <div className="pointer-events-none fixed -right-28 top-[520px] -z-10 h-[360px] w-[360px] rounded-full bg-[#dfe8d6]/30 blur-3xl" />

      <DashboardNavbar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>

      {modal}

      <Footer
        socialLinks={
          socialLinks || []
        }
      />
    </div>
  );
}