"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { setInitialPassword } from "./actions";

const initialState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-2xl bg-[#173c45] px-5 py-4 font-semibold text-white shadow-[0_14px_30px_rgba(23,60,69,.2)] transition hover:-translate-y-0.5 hover:bg-[#244f59] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "Securing your account…" : "Set password and continue →"}
    </button>
  );
}

export default function SetTemporaryPasswordForm() {
  const [state, formAction] = useActionState(setInitialPassword, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-[#294952]">
        New password
        <span className="relative mt-2 block">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            className="w-full rounded-2xl border border-[#ccd7d8] bg-white px-4 py-3.5 pr-20 outline-none transition focus:border-[#587b83] focus:ring-4 focus:ring-[#dce8e9]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-1 right-1 rounded-xl px-4 text-xs font-bold uppercase tracking-[.08em] text-[#63777c] transition hover:bg-[#eef2f1]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <label className="block text-sm font-semibold text-[#294952]">
        Confirm new password
        <input
          name="confirmation"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          className="mt-2 w-full rounded-2xl border border-[#ccd7d8] bg-white px-4 py-3.5 outline-none transition focus:border-[#587b83] focus:ring-4 focus:ring-[#dce8e9]"
        />
      </label>

      <p className="text-xs leading-5 text-[#6f7f82]">
        Use at least 10 characters with an uppercase letter, a lowercase letter, and a number.
      </p>

      {state?.error && (
        <p role="alert" className="rounded-2xl border border-[#efccc5] bg-[#fff1ed] px-4 py-3 text-sm leading-6 text-[#8a3d32]">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
