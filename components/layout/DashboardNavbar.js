"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const MAIN_NAV = [
  {
    href: "/dashboard",
    label: "Overview",
  },
  {
    href: "/library",
    label: "Library",
  },
  {
    href: "/favourites",
    label: "Favourites",
  },
  {
    href: "/mood",
    label: "Mood",
  },
];

const ACCOUNT_NAV = [
  {
    href: "/programs",
    label: "Programs",
  },
  {
    href: "/account",
    label: "Account",
  },
  {
    href: "/account/billing",
    label: "Billing",
  },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const searchInputRef = useRef(null);

  const currentQuery =
    searchParams.get("q") || "";

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchOpen]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const formData =
      new FormData(event.currentTarget);

    const query = String(
      formData.get("q") || ""
    ).trim();

    if (!query) {
      router.push("/library");
      setSearchOpen(false);
      return;
    }

    router.push(
      `/library?q=${encodeURIComponent(
        query
      )}`
    );

    setSearchOpen(false);
  }

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-6 px-6 lg:px-10">
        {/* LOGO */}

        <Link
          href="/library"
          aria-label="MindSettle Library"
          className="flex shrink-0 items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <Image
            src="/logo.png"
            alt="MindSettle"
            width={48}
            height={48}
            priority
            className="h-11 w-11 object-contain"
          />
        </Link>

        {/* MAIN NAV */}

        <nav className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => {
            const active =
              isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}

        <div className="ml-auto flex items-center gap-3">
          {/* SEARCH */}

          <div className="flex items-center">
            {searchOpen ? (
              <form
                onSubmit={
                  handleSearchSubmit
                }
                className="flex h-11 items-center overflow-hidden rounded-full border border-emerald-300 bg-white shadow-sm ring-2 ring-emerald-50"
              >
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-600 transition hover:text-emerald-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />

                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>

                <input
                  key={currentQuery}
                  ref={searchInputRef}
                  name="q"
                  type="search"
                  defaultValue={currentQuery}
                  placeholder="Search MindSettle..."
                  aria-label="Search MindSettle"
                  className="w-48 bg-transparent pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:w-56 lg:w-64"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                  aria-label="Close search"
                  className="flex h-11 w-10 shrink-0 items-center justify-center text-lg font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  ×
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setSearchOpen(true)
                }
                aria-label="Search library"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            )}
          </div>

          {/* MY MINDSETTLE */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (open) => !open
                )
              }
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                M
              </span>

              <span className="hidden sm:inline">
                My MindSettle
              </span>

              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 transition ${
                  menuOpen
                    ? "rotate-180"
                    : ""
                }`}
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.5 7.5 10 12l4.5-4.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {ACCOUNT_NAV.map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}