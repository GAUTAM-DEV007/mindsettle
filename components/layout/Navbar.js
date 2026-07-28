import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/explore", label: "Explore" },
];

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Mindsettle logo"
            width={48}
            height={48}
            priority
            className="rounded-full object-cover"
          />

          <span className="text-lg font-semibold tracking-tight text-slate-950">
            mindsettle
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 transition hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Button href="/login" variant="primary">
          Login
        </Button>
      </nav>
    </header>
  );
}