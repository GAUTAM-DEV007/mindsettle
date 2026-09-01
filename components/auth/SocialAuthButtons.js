"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOAuthCallbackUrl } from "@/lib/auth/oauth";

const PROVIDERS = [
  {
    id: "apple",
    label: "Apple",
    mark: "A",
    markClassName: "bg-[#171918] text-white",
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
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${provider.markClassName}`}
              >
                {provider.mark}
              </span>
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
