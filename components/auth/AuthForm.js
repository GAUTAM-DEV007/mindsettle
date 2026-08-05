"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }) {
  // mode: "login" | "signup" | "organisation-signup"
  const isSignup = mode === "signup" || mode === "organisation-signup";
  const requestedRole = mode === "organisation-signup" ? "organisation" : null;
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          // Read by the handle_new_user trigger (see supabase/migrations)
          // to decide which row to insert into user_roles. Login doesn't
          // need this -- role is looked up fresh on every login instead.
          options: requestedRole
            ? { data: { requested_role: requestedRole } }
            : undefined,
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Let /post-login look up the role and send the user to the right
    // dashboard, instead of assuming /dashboard here.
    router.push("/post-login");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {isSubmitting
          ? "Please wait..."
          : isSignup
            ? "Create account"
            : "Log in"}
      </button>
    </form>
  );
}
