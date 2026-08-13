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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sky-200 bg-sky-50/95 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        
        {/* Logo */}
       
  <Link href="/" className="flex h-20 items-center">
  <Image
    src="/logo.png"
    alt="Mindsettle logo"
    width={110}
    height={110}
    priority
    className="h-20 w-20 object-cover rounded-full"
  />
</Link>

        {/* Navigation */}
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

        {/* Login */}
        <Button href="/login" variant="primary">
          Login
        </Button>

      </nav>
    </header>
  );
}