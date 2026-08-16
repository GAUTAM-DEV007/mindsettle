import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="auth-home-link mb-8 text-lg font-semibold tracking-tight"
      >
        mindsettle
      </Link>
      {children}
    </main>
  );
}
