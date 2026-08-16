"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  {
    id: "google",
    label: "Google",
    mark: "G",
    markClassName: "bg-white text-[#4285f4] ring-1 ring-[#d8e0e8]",
  },
  {
    id: "apple",
    label: "Apple",
    mark: "A",
    markClassName: "bg-[#171918] text-white",
  },
  {
    id: "facebook",
    label: "Facebook",
    mark: "f",
    markClassName: "bg-[#1877f2] text-white",
  },
];

export default function SocialAuthButtons({ intent = "signin" }) {
  const [supabase] = useState(() => createClient());
  const [pendingProvider, setPendingProvider] = useState(null);
  const [error, setError] = useState(null);

  async function handleSocialAuth(provider) {
    setError(null);
    setPendingProvider(provider.id);

    const redirectTo = `${window.location.origin}/auth/callback?redirectTo=/post-login`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: provider.id,
      options: { redirectTo },
    });

    if (authError) {
      setPendingProvider(null);
      const providerDisabled = /provider.*not.*enabled/i.test(
        authError.message || ""
      );
      setError(
        providerDisabled
          ? `${provider.label} access is being prepared. Please use email for now.`
          : `We could not continue with ${provider.label}. Please try again.`
      );
    }
  }

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-3">
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
