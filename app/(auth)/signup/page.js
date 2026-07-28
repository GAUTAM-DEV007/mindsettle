import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>
      <AuthForm mode="signup" />
      <p className="mt-6 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
