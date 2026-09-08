"use server";

import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signIn(_previousState, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  if (!EMAIL_RE.test(email) || email.length > 320 || !password || password.length > 128) {
    return { error: "Enter a valid email address and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Keep credentials out of logs, but retain enough information to diagnose
    // environment-specific Auth failures during local development and in
    // Vercel's server logs.
    console.warn("[auth] Password sign-in failed", {
      code: error.code ?? null,
      status: error.status ?? null,
      name: error.name ?? null,
    });

    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email using the link in your inbox before signing in." };
    }

    if (error.code === "over_request_rate_limit") {
      return { error: "There have been too many sign-in attempts. Please wait a moment and try again." };
    }

    if (error.status === 402) {
      return { error: "Account services are temporarily restricted. Please contact support." };
    }

    if (error.code === "invalid_credentials") {
      return { error: "That email and password combination was not accepted. Try typing the password again or reset it." };
    }

    if (error.name === "AuthRetryableFetchError" || error.status >= 500) {
      return { error: "The account service is temporarily unavailable. Please wait a moment and try again." };
    }

    return { error: "Sign-in failed. Check your email and password, then try again." };
  }

  // The server client writes the new session cookies before Next.js sends
  // this redirect, so /post-login can read the same authenticated session.
  redirect(redirectTo);
}
