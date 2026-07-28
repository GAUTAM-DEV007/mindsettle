import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight">
        mindsettle
      </Link>
      {children}
    </main>
  );
}
