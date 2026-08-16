"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

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
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[42%_58%]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-emerald-900 px-10 text-white lg:flex lg:items-center lg:justify-center">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto flex h-36 w-52 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
            <Image
              src="/logo-full.png"
              alt="Mindsettle logo"
              width={176}
              height={108}
              priority
              className="rounded-2xl bg-white/90 p-3 object-contain"
            />
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight">
            Welcome to Mindsettle
          </h1>

          <p className="mt-4 text-lg leading-8 text-sky-100">
            A calm digital space for mindfulness, wellbeing, and better daily
            habits.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              Calm
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              Focus
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              Reset
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
            <div>
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Secure login
              </span>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
                Welcome Back
              </h2>

              <p className="mt-3 text-base text-slate-600">
                Sign in to continue your wellness journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={320}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:from-sky-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                New to Mindsettle?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-3 text-center text-sm text-slate-600">
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Sign up
                </Link>
              </p>

              <p>
                Registering an organisation?{" "}
                <Link
                  href="/organisation-register"
                  className="font-semibold text-sky-700 hover:text-sky-900"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
