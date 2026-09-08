"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/organisation-dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/organisation-dashboard/members", label: "Members", icon: "members" },
  { href: "/organisation-dashboard/programs", label: "Programs", icon: "programs" },
  { href: "/organisation-dashboard/reports", label: "Reports", icon: "reports" },
  { href: "/dashboard", label: "My wellbeing", icon: "wellbeing" },
  { href: "/subscription", label: "Subscription", icon: "subscription" },
  { href: "/account", label: "Settings", icon: "settings" },
];

export default function OrganisationSidebar({ organisationName, email }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#dfe5dc] bg-[#fffdfa]/95 px-5 backdrop-blur lg:hidden">
        <Link href="/organisation-dashboard" aria-label="MindSettle organisation dashboard">
          <Image src="/logo-full.png" alt="MindSettle" width={833} height={489} priority className="h-14 w-auto object-contain" />
        </Link>
        <button
          type="button"
          aria-label={isOpen ? "Close organisation menu" : "Open organisation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-full border border-[#d9e1db] bg-white text-[#163d34] shadow-sm transition hover:bg-[#eef3e8]"
        >
          <MenuIcon open={isOpen} />
        </button>
      </header>

      {isOpen && (
        <button
          type="button"
          aria-label="Close organisation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-[#102f29]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[18rem] flex-col border-r border-[#dfe5dc] bg-[#fffdfa] px-5 py-6 shadow-2xl shadow-[#163d34]/10 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between">
          <Link href="/organisation-dashboard" aria-label="MindSettle organisation dashboard" className="inline-flex" onClick={() => setIsOpen(false)}>
            <Image src="/logo-full.png" alt="MindSettle" width={833} height={489} priority className="h-[5.25rem] w-auto object-contain" />
          </Link>
          <button
            type="button"
            aria-label="Close organisation menu"
            onClick={() => setIsOpen(false)}
            className="mt-1 grid h-9 w-9 place-items-center rounded-full text-[#5f736c] transition hover:bg-[#eef3e8] lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-[#163d34] px-4 py-4 text-white shadow-[0_14px_35px_rgba(22,61,52,0.18)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d7f2ad] text-sm font-bold text-[#163d34]">
              {getInitials(organisationName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{organisationName}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/60">{email}</p>
            </div>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7f2ad]">
            Organisation admin
          </p>
        </div>

        <nav aria-label="Organisation navigation" className="mt-6 flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/organisation-dashboard" && pathname.startsWith(item.href));

            return (
              <div key={item.href}>
                {index === 4 && (
                  <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a9a94]">Personal</p>
                )}
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-[#e8f1df] text-[#163d34] shadow-sm" : "text-[#5a6d66] hover:bg-[#f0f3ed] hover:text-[#163d34]"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                    isActive ? "bg-[#163d34] text-[#d7f2ad]" : "bg-[#edf1eb] text-[#6d837a] group-hover:bg-white group-hover:text-[#163d34]"
                  }`}>
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#78906f]" />}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-[#e4e8e2] pt-4">
          <Link href="/contact" onClick={() => setIsOpen(false)} className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#5a6d66] transition hover:bg-[#f0f3ed] hover:text-[#163d34]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf1eb]"><NavIcon name="support" /></span>
            Help &amp; support
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#a94d43] transition hover:bg-[#fff0ed]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff0ed]"><NavIcon name="logout" /></span>
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function getInitials(name) {
  const words = String(name || "Organisation").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "O";
}

function MenuIcon({ open }) {
  return open ? <CloseIcon /> : <NavIcon name="menu" />;
}

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /></svg>;
}

function NavIcon({ name }) {
  const paths = {
    dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    members: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M17 11a3 3 0 1 0-2.4-4.8M16.5 14.8a4 4 0 0 1 4.5 3.9V20" /></>,
    programs: <><path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" /><path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8h6" /></>,
    reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    wellbeing: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
    subscription: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 9.5h18M7 15h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 15a1.7 1.7 0 0 0 .3 1.9l-2.4 2.4a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.5A1.7 1.7 0 0 0 9 19a1.7 1.7 0 0 0-1.9.3l-2.4-2.4A1.7 1.7 0 0 0 5 15a1.7 1.7 0 0 0-1.5-1H3v-4h.5A1.7 1.7 0 0 0 5 9a1.7 1.7 0 0 0-.3-1.9l2.4-2.4A1.7 1.7 0 0 0 9 5a1.7 1.7 0 0 0 1-1.5V3h4v.5A1.7 1.7 0 0 0 15 5a1.7 1.7 0 0 0 1.9-.3l2.4 2.4A1.7 1.7 0 0 0 19 9a1.7 1.7 0 0 0 1.5 1h.5v4h-.5a1.7 1.7 0 0 0-1.5 1Z" /></>,
    support: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9.2a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2M12 17h.01" /></>,
    logout: <><path d="M10 5H5.5A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19H10M14 8l4 4-4 4M18 12H8" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
