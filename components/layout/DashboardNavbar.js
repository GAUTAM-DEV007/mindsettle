"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

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
    href: "/programs",
    label: "Programs",
  },
  {
    href: "/favourites",
    label: "Favourites",
  },
  {
    href: "/mood",
    label: "Mood",
  },
  {
    href: "/subscription",
    label: "Subscription",
  },
];

const ACCOUNT_NAV = [
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
  const pathname =
    usePathname();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    menuLocation,
    setMenuLocation,
  ] = useState(null);

  const locationKey = `${pathname}?${searchParams.toString()}`;
  const menuOpen = menuLocation === locationKey;
  const menuRef = useRef(null);
  const menuTriggerRef = useRef(null);

  function setMenuOpen(open) {
    setMenuLocation(open ? locationKey : null);
  }

  function toggleMenu(event) {
    menuTriggerRef.current = event.currentTarget;
    setSearchOpen(false);
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    if (!menuOpen) return;

    function closeOutside(event) {
      if (!menuRef.current?.contains(event.target)) setMenuLocation(null);
    }

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setMenuLocation(null);
      menuTriggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const searchInputRef =
    useRef(null);

  const currentQuery =
    searchParams.get("q") ||
    "";

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          searchInputRef.current?.focus();
        },
        50
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [searchOpen]);

  function handleSearchSubmit(
    event
  ) {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget
      );

    const query =
      String(
        formData.get("q") ||
          ""
      ).trim();

    if (!query) {
      router.push(
        "/library"
      );

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

  function isActive(
    href
  ) {
    if (
      href ===
      "/dashboard"
    ) {
      return (
        pathname ===
        "/dashboard"
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-2 px-3 sm:gap-4 sm:px-6 xl:gap-6 lg:px-10">
        {/* LOGO */}

        <Link
          href="/library"
          aria-label="MindSettle Library"
          className="flex shrink-0 items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          <Image
            src="/logo-full.png"
            alt="MindSettle"
            width={120}
            height={74}
            priority
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* MAIN NAV */}

        <nav className="hidden items-center gap-1 xl:flex">
          {MAIN_NAV.map(
            (item) => {
              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-100 text-emerald-900"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  {
                    item.label
                  }
                </Link>
              );
            }
          )}
        </nav>

        {/* RIGHT */}

        <div className="ml-auto flex items-center gap-2 xl:gap-3">
          {/* SEARCH */}

          <div className="flex items-center">
            {searchOpen ? (
              <form
                onSubmit={
                  handleSearchSubmit
                }
                className="absolute inset-x-3 top-full mt-2 flex h-11 min-w-0 items-center overflow-hidden rounded-full sm:inset-x-6 xl:left-auto xl:right-10 xl:w-96 border border-emerald-300 bg-white shadow-sm ring-2 ring-emerald-50"
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
                  key={
                    currentQuery
                  }
                  ref={
                    searchInputRef
                  }
                  name="q"
                  type="search"
                  defaultValue={
                    currentQuery
                  }
                  placeholder="Search MindSettle..."
                  aria-label="Search MindSettle"
                  className="min-w-0 w-full flex-1 bg-transparent pr-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(
                      false
                    )
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
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
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

          <div ref={menuRef} className="relative flex items-center gap-2 xl:block">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="dashboard-navigation-menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 xl:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={menuOpen ? "M6 6l12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              aria-controls="dashboard-navigation-menu"
              aria-label="My MindSettle navigation menu"
              aria-expanded={
                menuOpen
              }
              className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white xl:h-auto xl:w-auto xl:px-4 xl:py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                M
              </span>

              <span className="hidden xl:inline">
                My MindSettle
              </span>

              <svg
                viewBox="0 0 20 20"
                className={`hidden h-4 w-4 transition xl:block ${
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
              <div id="dashboard-navigation-menu" className="absolute right-0 top-full mt-3 max-h-[calc(100dvh-6rem)] w-64 xl:w-52 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <nav aria-label="Dashboard navigation" className="border-b border-slate-100 pb-1 xl:hidden">
                  {MAIN_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium ${isActive(item.href) ? "bg-emerald-100 text-emerald-900" : "text-slate-700 hover:bg-emerald-50"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                {ACCOUNT_NAV.map(
                  (item) => (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      onClick={() =>
                        setMenuOpen(
                          false
                        )
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900"
                    >
                      {
                        item.label
                      }
                    </Link>
                  )
                )}
                <form action={signOut} className="mt-1 border-t border-slate-100 pt-1">
                  <button type="submit" className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-50">
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}