"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }) {
  const isOrganisation = mode === "organisation-signup";
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=/post-login`;
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: callbackUrl, data: { full_name: fullName.trim(), ...(isOrganisation ? { requested_role: "organisation" } : {}) } },
    });
    setIsSubmitting(false);
    if (authError) { setError(authError.message || "We could not create your account. Please try again."); return; }
    if (!data.session) { setNotice("Check your email to confirm your account, then return here to sign in."); return; }
    router.push("/post-login");
    router.refresh();
  }

  if (notice) return <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"><p className="font-semibold text-emerald-900">Account created</p><p className="mt-2 text-sm leading-6 text-emerald-800">{notice}</p></div>;

  return <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">Full name<input name="fullName" autoComplete="name" required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">Email<input name="email" type="email" autoComplete="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">Password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="text-xs font-normal text-slate-500">Use at least 8 characters.</span></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <button type="submit" disabled={isSubmitting} className="mt-2 rounded-full bg-[#163d34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285c4f] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating account…" : isOrganisation ? "Register organisation" : "Create account"}</button>
  </form>;
}
