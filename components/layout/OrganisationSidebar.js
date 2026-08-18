"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/organisation-dashboard", label: "Dashboard" },
  { href: "/organisation-dashboard/members", label: "Members" },
  { href: "/organisation-dashboard/programs", label: "Programs" },
  { href: "/organisation-dashboard/reports", label: "Reports" },
  { href: "/subscription", label: "Subscription" },
  { href: "/account", label: "Settings" },
];

export default function OrganisationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 px-4 py-6">
      <Link href="/" className="mb-8 block text-lg font-semibold tracking-tight">
        mindsettle
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/organisation-dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Logout
          </button>
        </form>
      </nav>
    </aside>
  );
}
