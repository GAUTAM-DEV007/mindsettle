"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOAuthCallbackUrl } from "@/lib/auth/oauth";

const PROVIDERS = [
  {
    id: "google",
    label: "Google",
  },
];

export default function SocialAuthButtons({ intent = "signin", redirectTo = "/post-login" }) {
  const [supabase] = useState(() => createClient());
  const [pendingProvider, setPendingProvider] = useState(null);
  const [error, setError] = useState(null);

  async function handleSocialAuth(provider) {
    setError(null);
    setPendingProvider(provider.id);

    try {
      const response = await fetch("/api/auth/providers", {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Could not check sign-in availability");
      const providers = await response.json();
      if (providers[provider.id] !== true) {
        setError(`${provider.label} access is not configured yet. Please use email for now.`);
        return;
      }

      const callbackUrl = getOAuthCallbackUrl(window.location.origin, redirectTo);
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: provider.id,
        options: { redirectTo: callbackUrl, skipBrowserRedirect: true },
      });
      if (authError || !data?.url) throw new Error("Could not start sign-in");
      window.location.assign(data.url);
    } catch {
      setError(`We could not continue with ${provider.label}. Please try again or use email.`);
    } finally {
      // Also recover the controls when returning with the browser's Back button.
      setPendingProvider(null);
    }
  }

  return (
    <div>
      <div className="grid gap-2.5">
        {PROVIDERS.map((provider) => {
          const isPending = pendingProvider === provider.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleSocialAuth(provider)}
              disabled={pendingProvider !== null}
              aria-label={`${intent === "signup" ? "Sign up" : "Sign in"} with ${provider.label}`}
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#d5ddd7] bg-white/75 px-3 py-3 text-sm font-semibold text-[#28483f] shadow-sm transition hover:-translate-y-0.5 hover:border-[#9eafa7] hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dce8e1] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
              <GoogleMark />
              <span>{isPending ? "Opening…" : provider.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-[#efccc5] bg-[#fff1ed] px-4 py-3 text-sm leading-6 text-[#8a3d32]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.53l3.35-2.61Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5L18.7 4.57A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  );
}
