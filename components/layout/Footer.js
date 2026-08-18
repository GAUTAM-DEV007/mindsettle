"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Footer({
  socialLinks = [],
}) {
  const [shareStatus, setShareStatus] =
    useState("");

  const visibleSocialLinks =
    Array.isArray(socialLinks)
      ? socialLinks
          .filter(
            (social) =>
              social &&
              social.is_enabled !== false &&
              Boolean(social.url)
          )
          .sort(
            (a, b) =>
              Number(a.sort_order || 0) -
              Number(b.sort_order || 0)
          )
      : [];

  async function shareMindSettle() {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "/";

    const shareData = {
      title: "MindSettle",
      text: "Settle someone's mind with MindSettle.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
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
    } catch (error) {
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
        setShareStatus("");
      },
      2000
    );
  }

  return (
    <footer className="border-t border-[#9bb98a]/30 bg-[#282c2b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">

        {/* MAIN FOOTER */}

        <div className="grid gap-10 border-b border-white/10 pb-10 sm:gap-12 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:pb-12">

          {/* BRAND */}

          <div>
            <Link
              href="/"
              aria-label="MindSettle home"
              className="inline-flex rounded-2xl bg-[#eef1ed] p-3 ring-1 ring-white/15"
            >
              <Image
                src="/logo-full.png"
                alt="MindSettle"
                width={156}
                height={96}
                className="h-20 w-auto object-contain sm:h-24"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#c5ccc8] sm:text-base">
              An Australian profit-for-purpose enterprise bringing
              art, science and technology together to create calm.
            </p>
          </div>

          {/* EXPLORE */}

          <nav aria-label="Footer navigation">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b7d889]">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-[#d8ddda]">
              <Link
                href="/about"
                className="transition hover:text-[#d7f2ad]"
              >
                Meet the minds
              </Link>

              <Link
                href="/explore"
                className="transition hover:text-[#d7f2ad]"
              >
                Resources
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-[#d7f2ad]"
              >
                Contact us
              </Link>

              <Link
                href="/terms"
                className="transition hover:text-[#d7f2ad]"
              >
                Terms of service
              </Link>

              <Link
                href="/privacy"
                className="transition hover:text-[#d7f2ad]"
              >
                Privacy policy
              </Link>
            </div>
          </nav>

          {/* CONNECT */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b7d889]">
              Connect
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-[#d8ddda]">

              {/* DYNAMIC SUPABASE SOCIAL LINKS */}

              {visibleSocialLinks.map(
                (social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit transition hover:text-[#d7f2ad]"
                  >
                    {social.platform} ↗
                  </a>
                )
              )}

              {/* SHARE */}

              <button
                type="button"
                onClick={
                  shareMindSettle
                }
                className="w-fit text-left transition hover:text-[#d7f2ad]"
              >
                Share MindSettle ↗
              </button>

              {shareStatus && (
                <span className="text-xs font-semibold text-[#b7d889]">
                  {shareStatus}
                </span>
              )}

              <a
                href="mailto:mindsettle@gmail.com"
                className="w-fit transition hover:text-[#d7f2ad]"
              >
                mindsettle@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* ACKNOWLEDGEMENT */}

        <p className="max-w-5xl border-b border-white/10 py-6 text-xs leading-6 text-[#aeb8b3] sm:py-8 sm:text-sm">
          MindSettle acknowledges the Traditional Owners of the
          lands on which we operate across Australia. We
          acknowledge Elders past and present, and recognise that
          this always was and always will be Aboriginal land.
        </p>

        {/* BOTTOM */}

        <div className="flex flex-col gap-2 pt-6 text-xs text-[#8f9a95] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} MindSettle. All rights
            reserved.
          </p>

          <p className="text-[#a9c39a]">
            Let your mind settle.
          </p>
        </div>
      </div>
    </footer>
  );
}