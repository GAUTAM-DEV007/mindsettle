import Link from "next/link";
import Button from "@/components/ui/Button";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          mindsettle
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost">
            Log in
          </Button>
          <Button href="/signup" variant="primary">
            Start free trial
          </Button>
        </div>
      </nav>
    </header>
  );
}
