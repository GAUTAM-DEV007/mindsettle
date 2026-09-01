import { redirect } from "next/navigation";

import SetTemporaryPasswordForm from "./SetTemporaryPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.must_change_password !== true) redirect("/post-login");

  return (
    <section className="w-full max-w-md rounded-[2rem] border border-[#dce4df] bg-[#faf9f4] p-7 shadow-[0_28px_80px_rgba(23,60,69,.16)] sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a35f4e]">First sign-in</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-.035em] text-[#173c45]">
        Make this account yours.
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#647277]">
        Your organisation gave you a temporary password. Replace it now before opening your private member dashboard.
      </p>
      <SetTemporaryPasswordForm />
    </section>
  );
}
