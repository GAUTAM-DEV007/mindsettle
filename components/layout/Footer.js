"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [shareStatus, setShareStatus] =
    useState("");

  async function shareMindSettle() {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/`
        : "/";

    const shareData = {
      title: "MindSettle",
      text: "Settle someone's mind with MindSettle.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareStatus("Link copied");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Could not share MindSettle:",
          error
        );
      }
    }

    window.setTimeout(() => {
      setShareStatus("");
    }, 2000);
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10">

        {/* MAIN FOOTER ROW */}

        <div className="flex flex-col gap-6 py-7 lg:flex-row lg:items-center lg:justify-between">

          {/* BRAND */}

          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="MindSettle home"
              className="flex items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="MindSettle"
                className="h-9 w-9 object-contain"
              />

              <span className="text-base font-bold text-emerald-900">
                MindSettle
              </span>
            </Link>
          </div>

          {/* SHARE + SOCIAL */}

          <div className="flex flex-col gap-3 lg:items-center">
            <p className="text-sm font-semibold text-slate-800">
              Settle someone&apos;s mind with MindSettle
            </p>

            <div className="flex items-center gap-2.5">

              {/* SHARE */}

              <button
                type="button"
                onClick={shareMindSettle}
                title="Share MindSettle"
                aria-label="Share MindSettle"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 10.6 6.8-4.2" />
                  <path d="m8.6 13.4 6.8 4.2" />
                </svg>
              </button>

              {/* INSTAGRAM */}

              <button
                type="button"
                title="Instagram"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </button>

              {/* FACEBOOK */}

              <button
                type="button"
                title="Facebook"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <span className="text-base font-bold">
                  f
                </span>
              </button>

              {/* YOUTUBE */}

              <button
                type="button"
                title="YouTube"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="12"
                    rx="4"
                  />

                  <path d="m10 9 5 3-5 3Z" />
                </svg>
              </button>

              {/* LINKEDIN */}

              <button
                type="button"
                title="LinkedIn"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <span className="text-xs font-bold">
                  in
                </span>
              </button>
            </div>

            {shareStatus && (
              <span className="text-xs font-semibold text-emerald-700">
                {shareStatus}
              </span>
            )}
          </div>

          {/* LINKS */}

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-emerald-700"
            >
              Home
            </Link>

            <Link
              href="/library"
              className="transition hover:text-emerald-700"
            >
              Library
            </Link>

            <Link
              href="/programs"
              className="transition hover:text-emerald-700"
            >
              Programs
            </Link>

            <Link
              href="/pricing"
              className="transition hover:text-emerald-700"
            >
              Pricing
            </Link>

            <a
              href="mailto:support@mindsettle.app"
              className="transition hover:text-emerald-700"
            >
              Support
            </a>
          </nav>
        </div>

        {/* COPYRIGHT */}

        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} MindSettle.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}