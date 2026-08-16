"use client";

import Link from "next/link";
import { useState } from "react";

/* =========================================================
   SOCIAL ICON
========================================================= */

function SocialIcon({
  platform,
}) {
  const name =
    String(
      platform || ""
    )
      .trim()
      .toLowerCase();

  /* ======================================================
     INSTAGRAM
  ====================================================== */

  if (
    name.includes(
      "instagram"
    )
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
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
    );
  }

  /* ======================================================
     FACEBOOK
  ====================================================== */

  if (
    name.includes(
      "facebook"
    )
  ) {
    return (
      <span className="text-base font-bold">
        f
      </span>
    );
  }

  /* ======================================================
     YOUTUBE
  ====================================================== */

  if (
    name.includes(
      "youtube"
    )
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
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
    );
  }

  /* ======================================================
     LINKEDIN
  ====================================================== */

  if (
    name.includes(
      "linkedin"
    )
  ) {
    return (
      <span className="text-xs font-bold">
        in
      </span>
    );
  }

  /* ======================================================
     TIKTOK
  ====================================================== */

  if (
    name.includes(
      "tiktok"
    ) ||
    name.includes(
      "tik tok"
    )
  ) {
    return (
      <span className="text-sm font-bold">
        ♪
      </span>
    );
  }

  /* ======================================================
     X / TWITTER
  ====================================================== */

  if (
    name === "x" ||
    name.includes(
      "twitter"
    )
  ) {
    return (
      <span className="text-sm font-bold">
        X
      </span>
    );
  }

  /* ======================================================
     GENERIC
  ====================================================== */

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14 3h7v7" />

      <path d="M10 14 21 3" />

      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

/* =========================================================
   SOCIAL LINK
========================================================= */

function SocialLink({
  social,
}) {
  if (
    !social?.url
  ) {
    return null;
  }

  return (
    <a
      href={
        social.url
      }
      target="_blank"
      rel="noopener noreferrer"
      title={
        social.platform
      }
      aria-label={
        social.platform
      }
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        text-slate-500
        transition

        hover:-translate-y-0.5
        hover:border-emerald-300
        hover:bg-emerald-50
        hover:text-emerald-700

        focus:outline-none
        focus:ring-2
        focus:ring-emerald-300
      "
    >
      <SocialIcon
        platform={
          social.platform
        }
      />
    </a>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export default function Footer({
  socialLinks = [],
}) {
  const [
    shareStatus,
    setShareStatus,
  ] =
    useState("");

  /* ======================================================
     VALID SOCIAL LINKS

     Extra frontend guard.

     Server already filters enabled links, but this keeps
     Footer safe if reused somewhere else.
  ====================================================== */

  const visibleSocialLinks =
    Array.isArray(
      socialLinks
    )
      ? socialLinks
          .filter(
            (
              social
            ) =>
              social &&
              social.is_enabled !==
                false &&
              Boolean(
                social.url
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              Number(
                a.sort_order ||
                  0
              ) -
              Number(
                b.sort_order ||
                  0
              )
          )
      : [];

  /* ======================================================
     SHARE
  ====================================================== */

  async function shareMindSettle() {
    const shareUrl =
      typeof window !==
      "undefined"
        ? `${window.location.origin}/`
        : "/";

    const shareData = {
      title:
        "MindSettle",

      text:
        "Settle someone's mind with MindSettle.",

      url:
        shareUrl,
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        );

        setShareStatus(
          "Shared"
        );
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareStatus(
          "Link copied"
        );
      }
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.error(
          "Could not share MindSettle:",
          error
        );
      }
    }

    window.setTimeout(
      () => {
        setShareStatus(
          ""
        );
      },
      2000
    );
  }

  /* ======================================================
     PAGE
  ====================================================== */

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10">
        {/* =================================================
            MAIN FOOTER ROW
        ================================================= */}

        <div className="flex flex-col gap-6 py-7 lg:flex-row lg:items-center lg:justify-between">
          {/* =================================================
              BRAND
          ================================================= */}

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
                className="
                  h-9
                  w-9
                  rounded-full
                  object-cover
                "
              />

              <span className="text-base font-bold text-emerald-900">
                MindSettle
              </span>
            </Link>
          </div>

          {/* =================================================
              SHARE + SOCIAL
          ================================================= */}

          <div className="flex flex-col gap-3 lg:items-center">
            <p className="text-sm font-semibold text-slate-800">
              Settle someone&apos;s mind with MindSettle
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* =============================================
                  SHARE
              ============================================= */}

              <button
                type="button"
                onClick={
                  shareMindSettle
                }
                title="Share MindSettle"
                aria-label="Share MindSettle"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-700
                  transition

                  hover:-translate-y-0.5
                  hover:bg-emerald-100

                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-300
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle
                    cx="18"
                    cy="5"
                    r="3"
                  />

                  <circle
                    cx="6"
                    cy="12"
                    r="3"
                  />

                  <circle
                    cx="18"
                    cy="19"
                    r="3"
                  />

                  <path d="m8.6 10.6 6.8-4.2" />

                  <path d="m8.6 13.4 6.8 4.2" />
                </svg>
              </button>

              {/* =============================================
                  REAL SUPABASE SOCIAL LINKS
              ============================================= */}

              {visibleSocialLinks.map(
                (
                  social
                ) => (
                  <SocialLink
                    key={
                      social.id
                    }
                    social={
                      social
                    }
                  />
                )
              )}
            </div>

            {/* ===============================================
                NO ENABLED SOCIAL ACCOUNTS

                We simply hide the icons.
                Share still remains available.
            =============================================== */}

            {shareStatus && (
              <span className="text-xs font-semibold text-emerald-700">
                {
                  shareStatus
                }
              </span>
            )}
          </div>

          {/* =================================================
              LINKS
          ================================================= */}

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

        {/* =================================================
            COPYRIGHT
        ================================================= */}

        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          ©{" "}
          {new Date().getFullYear()}{" "}
          MindSettle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}