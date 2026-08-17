"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); setPending(true); setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?redirectTo=/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    setPending(false);
    if (resetError) { setError("We could not send the reset email. Please try again."); return; }
    setSent(true);
  }
  return <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Account recovery</p><h1 className="mt-4 text-3xl font-semibold text-slate-950">Reset your password</h1><p className="mt-3 text-sm leading-6 text-slate-600">Enter your email and we&apos;ll send you a secure reset link.</p>{sent ? <div className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">If an account exists for that email, a reset link is on its way.</div> : <form onSubmit={handleSubmit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-slate-700">Email address<input type="email" autoComplete="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button type="submit" disabled={pending} className="w-full rounded-full bg-[#163d34] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Sending…" : "Send reset link"}</button></form>}<Link href="/login" className="mt-6 inline-block text-sm font-semibold text-emerald-800">← Back to login</Link></div>;
}
