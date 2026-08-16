"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="login-experience grid min-h-dvh overflow-hidden bg-[#eef0e9] lg:grid-cols-[minmax(0,1.05fr)_minmax(31rem,.95fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden text-white lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/hero-forest-stream.jpg"
          alt="Water flowing through a quiet forest stream"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 0vw"
          className="login-nature-image object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,38,35,.34)_0%,rgba(8,39,34,.12)_36%,rgba(7,31,29,.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(222,241,189,.18),transparent_32%)]" />

        <Link
          href="/"
          aria-label="Mindsettle home"
          className="relative z-10 m-10 flex w-fit items-center rounded-2xl border border-white/30 bg-[#f8f7f0]/90 px-5 py-3 shadow-xl shadow-black/10 backdrop-blur-md transition hover:bg-white"
        >
          <Image
            src="/logo-full.png"
            alt="Mindsettle"
            width={138}
            height={84}
            className="h-auto w-[7.25rem] object-contain"
          />
        </Link>

        <div className="relative z-10 max-w-2xl px-10 pb-12 xl:px-16 xl:pb-16">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.24em] text-[#d9f3aa]">
            <span className="h-2 w-2 rounded-full bg-[#d9f3aa]" />
            Your calm space
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-.04em] xl:text-6xl">
            Return to a quieter state of mind.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/78">
            Nature-led moments, mindful tools and gentle routines—ready when
            you are.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 text-sm font-medium text-white/90">
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md">
              Curated calm
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md">
              Personal library
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md">
              Mindful moments
            </span>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#d9e8cf]/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-4 h-80 w-80 rounded-full bg-[#e9d8c5]/55 blur-3xl" />

        <div className="relative z-10 w-full max-w-[33rem]">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Mindsettle home">
              <Image
                src="/logo-full.png"
                alt="Mindsettle"
                width={126}
                height={76}
                priority
                className="h-auto w-24 object-contain"
              />
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-[#52645e] transition hover:text-[#163d34]"
            >
              Back home
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-[#fbfbf7]/90 p-6 shadow-[0_28px_80px_rgba(32,59,51,.12)] backdrop-blur-xl sm:p-9 xl:p-11">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#75856d]">
              Member access
            </p>
            <h2 className="mt-4 text-[2.65rem] font-semibold leading-none tracking-[-.045em] text-[#153b33] sm:text-5xl">
              Welcome back.
            </h2>
            <p className="mt-4 max-w-md text-[1.02rem] leading-7 text-[#61706a]">
              Take one steady breath, then continue where you left off.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#2d4a42]"
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
                  className="w-full rounded-2xl border border-[#ced8d2] bg-white/85 px-4 py-3.5 text-[#173e35] shadow-sm outline-none transition placeholder:text-[#9aa6a1] hover:border-[#aebfb7] focus:border-[#58796d] focus:bg-white focus:ring-4 focus:ring-[#dce8e1]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#2d4a42]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#567368] underline-offset-4 transition hover:text-[#163d34] hover:underline"
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
                    className="w-full rounded-2xl border border-[#ced8d2] bg-white/85 px-4 py-3.5 pr-20 text-[#173e35] shadow-sm outline-none transition placeholder:text-[#9aa6a1] hover:border-[#aebfb7] focus:border-[#58796d] focus:bg-white focus:ring-4 focus:ring-[#dce8e1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-1 right-1 rounded-xl px-4 text-xs font-bold uppercase tracking-[.08em] text-[#60756c] transition hover:bg-[#eef2ed] hover:text-[#163d34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e8e82]"
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
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#163d34] px-5 py-4 font-semibold text-white shadow-[0_14px_30px_rgba(22,61,52,.22)] transition hover:-translate-y-0.5 hover:bg-[#214d43] hover:shadow-[0_18px_34px_rgba(22,61,52,.26)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#bbcf9a] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span>{isSubmitting ? "Signing you in…" : "Sign in"}</span>
                {!isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="text-[#d6f2a7] transition-transform group-hover:translate-x-1"
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

            <div className="my-7 h-px bg-[#dfe5df]" />

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

            <p className="mt-6 text-center text-xs leading-5 text-[#839089]">
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
        </div>
      </section>
    </div>
  );
}
