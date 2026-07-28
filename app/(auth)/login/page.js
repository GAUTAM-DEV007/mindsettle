import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <AuthForm mode="login" />
      <p className="mt-6 text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-emerald-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
