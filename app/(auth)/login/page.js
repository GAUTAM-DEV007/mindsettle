"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const backgroundVideoRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundPaused, setBackgroundPaused] = useState(false);

  async function toggleBackgroundMotion() {
    const video = backgroundVideoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setBackgroundPaused(false);
      } catch {
        setBackgroundPaused(true);
      }
      return;
    }

    video.pause();
    setBackgroundPaused(true);
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (error) setError(null);

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    setIsSubmitting(false);

    if (authError) {
      setError("The email or password is incorrect. Please try again.");
      return;
    }

    const requestedPath = new URLSearchParams(window.location.search).get(
      "redirectTo"
    );
    const redirectTo =
      requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/post-login";

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="login-experience relative min-h-dvh overflow-x-hidden bg-[#172f37]">
      <Image
        src="/login-misty-lake.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover object-center"
      />
      <video
        ref={backgroundVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/login-misty-lake.jpg"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setBackgroundPaused(false)}
        onPause={() => setBackgroundPaused(true)}
        className="absolute inset-0 hidden h-full w-full object-cover sm:block motion-reduce:hidden"
      >
        <source src="/media/login-misty-lake.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,43,51,.64)_0%,rgba(26,48,56,.38)_48%,rgba(24,42,49,.68)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(238,226,204,.24),transparent_36%)]" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Link
          href="/"
          aria-label="Mindsettle home"
          className="flex items-center rounded-2xl border border-white/45 bg-[#f8f7f0]/90 px-4 py-2.5 shadow-[0_12px_35px_rgba(7,26,31,.18)] backdrop-blur-xl transition hover:bg-white"
        >
          <Image
            src="/logo-full.png"
            alt="Mindsettle"
            width={122}
            height={74}
            className="h-auto w-[6.6rem] object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleBackgroundMotion}
            className="hidden rounded-full border border-white/30 bg-[#17343d]/45 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:border-white/50 hover:bg-[#17343d]/70 sm:inline-flex motion-reduce:hidden"
            aria-label={backgroundPaused ? "Play background nature video" : "Pause background nature video"}
          >
            {backgroundPaused ? "Play motion" : "Pause motion"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/30 bg-[#17343d]/45 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:border-white/50 hover:bg-[#17343d]/70"
          >
            Back home
          </Link>
        </div>
      </div>

      <section className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-28 sm:px-6 sm:py-32">
        <div className="w-full max-w-[33rem] rounded-[2.25rem] border border-white/65 bg-[#faf9f4]/94 p-6 shadow-[0_32px_100px_rgba(7,26,31,.32)] backdrop-blur-2xl sm:p-9 lg:p-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#a35f4e]">
              Member access
            </p>
            <h1 className="mt-4 text-[2.65rem] font-semibold leading-none tracking-[-.045em] text-[#173c45] sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[1.02rem] leading-7 text-[#647277]">
              Take one steady breath, then continue where you left off.
            </p>
          </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-[1.125rem]">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#294952]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  spellCheck={false}
                  maxLength={320}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-[#ccd7d8] bg-white/88 px-4 py-3.5 text-[#173c45] shadow-sm outline-none transition placeholder:text-[#9aa6a8] hover:border-[#9fb4b7] focus:border-[#587b83] focus:bg-white focus:ring-4 focus:ring-[#dce8e9]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#294952]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#58757c] underline-offset-4 transition hover:text-[#173c45] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    maxLength={128}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-[#ccd7d8] bg-white/88 px-4 py-3.5 pr-20 text-[#173c45] shadow-sm outline-none transition placeholder:text-[#9aa6a8] hover:border-[#9fb4b7] focus:border-[#587b83] focus:bg-white focus:ring-4 focus:ring-[#dce8e9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-1 right-1 rounded-xl px-4 text-xs font-bold uppercase tracking-[.08em] text-[#63777c] transition hover:bg-[#eef2f1] hover:text-[#173c45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e8e91]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-[#efccc5] bg-[#fff1ed] px-4 py-3 text-sm leading-6 text-[#8a3d32]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#173c45] px-5 py-4 font-semibold text-white shadow-[0_14px_30px_rgba(23,60,69,.24)] transition hover:-translate-y-0.5 hover:bg-[#244f59] hover:shadow-[0_18px_34px_rgba(23,60,69,.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#bfd5d5] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>{isSubmitting ? "Signing you in…" : "Sign in"}</span>
                {!isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="text-[#f3c5ad] transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dfe5df]" />
              <span className="text-[.68rem] font-bold uppercase tracking-[.16em] text-[#86918b]">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-[#dfe5df]" />
            </div>

            <SocialAuthButtons />

            <div className="my-6 h-px bg-[#dfe5df]" />

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/signup"
                className="rounded-2xl border border-[#d5ddd7] bg-white/65 px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#9faf9f] hover:bg-white"
              >
                <span className="block text-xs font-bold uppercase tracking-[.14em] text-[#7a897f]">
                  New here?
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#183f36]">
                  Create an account →
                </span>
              </Link>
              <Link
                href="/organisation-register"
                className="rounded-2xl border border-[#d5ddd7] bg-white/65 px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[#9faf9f] hover:bg-white"
              >
                <span className="block text-xs font-bold uppercase tracking-[.14em] text-[#7a897f]">
                  For workplaces
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#183f36]">
                  Register an organisation →
                </span>
              </Link>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-[#839089]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-[#163d34]">
                Terms of Use
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[#163d34]">
                Privacy Policy
              </Link>
              .
            </p>
        </div>
      </section>
    </div>
  );
}
