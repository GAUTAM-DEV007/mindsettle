"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const LINKS = [{ href: "/about", label: "About" }, { href: "/features", label: "How it works" }, { href: "/explore", label: "Explore" }, { href: "/faq", label: "FAQ" }];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-[#173f35]/10 bg-[#f7f7f0]/90 backdrop-blur-xl">
    <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10" aria-label="Primary navigation">
      <Link href="/" aria-label="Mindsettle home" className="inline-flex items-center" onClick={() => setOpen(false)}><Image src="/logo-full.png" alt="" width={147} height={90} priority className="h-[4.5rem] w-auto object-contain" /></Link>
      <div className="hidden items-center gap-8 md:flex">{LINKS.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-[#435b54] transition hover:text-[#163d34]">{link.label}</Link>)}</div>
      <div className="hidden items-center gap-3 md:flex"><Link href="/login" className="px-3 py-2 text-sm font-semibold text-[#163d34]">Log in</Link><Link href="/contact" className="rounded-full bg-[#163d34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285c4f]">Talk to us</Link></div>
      <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#163d34]/20 text-xl text-[#163d34] md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span aria-hidden="true">{open ? "×" : "≡"}</span></button>
    </nav>
    {open && <div className="border-t border-[#163d34]/10 bg-[#f7f7f0] px-6 py-6 md:hidden"><div className="mx-auto flex max-w-7xl flex-col">{LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#163d34]/10 py-4 text-lg font-medium text-[#163d34]">{link.label}</Link>)}<div className="mt-6 grid grid-cols-2 gap-3"><Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-[#163d34]/25 px-5 py-3 text-center text-sm font-semibold text-[#163d34]">Log in</Link><Link href="/contact" onClick={() => setOpen(false)} className="rounded-full bg-[#163d34] px-5 py-3 text-center text-sm font-semibold text-white">Talk to us</Link></div></div></div>}
  </header>;
}
