import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function SignupPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>
      <div className="mb-6 w-full max-w-md">
        <SocialAuthButtons intent="signup" />
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Or use email</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>
      </div>
      <AuthForm mode="signup" />
      <p className="mt-5 max-w-md text-center text-xs leading-5 text-neutral-500">
        By creating an account, you agree to the{" "}
        <Link href="/terms" className="underline hover:text-emerald-800">
          Terms of Use
        </Link>{" "}
        and acknowledge the{" "}
        <Link href="/privacy" className="underline hover:text-emerald-800">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-6 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
