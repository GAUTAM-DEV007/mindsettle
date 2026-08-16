"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter(); const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(null); const [pending, setPending] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); setError(null);
    if (password !== confirmation) { setError("The passwords do not match."); return; }
    setPending(true); const { error: updateError } = await supabase.auth.updateUser({ password }); setPending(false);
    if (updateError) { setError(updateError.message || "The reset link may have expired. Request a new one."); return; }
    router.replace("/post-login"); router.refresh();
  }
  return <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Secure account</p><h1 className="mt-4 text-3xl font-semibold text-slate-950">Choose a new password</h1><form onSubmit={handleSubmit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-slate-700">New password<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label><label className="block text-sm font-semibold text-slate-700">Confirm password<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button type="submit" disabled={pending} className="w-full rounded-full bg-[#163d34] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Updating…" : "Update password"}</button></form></div>;
}
