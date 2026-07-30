"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Login details:", formData);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden items-center justify-center bg-slate-900 px-10 text-white lg:flex">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Mindsettle logo"
            className="mx-auto h-28 w-28 rounded-full object-cover"
          />

          <h1 className="mt-6 text-4xl font-bold">Mindsettle</h1>

          <p className="mt-3 text-sky-100">
            Your journey to mental wellness starts here.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-md">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
              Welcome Back
            </h2>

            <p className="mt-3 text-slate-600">
              Sign in to continue your wellness journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                />

                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Login
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-sm text-slate-600">
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
              Want to register an organisation?{" "}
              <Link
                href="/organisation-register"
                className="font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="my-8 border-t border-slate-200" />

          <div className="text-center">
            <Link
              href="/admin-login"
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}