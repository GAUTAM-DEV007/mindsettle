"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addMember } from "./actions";

const initialState = {
  error: null,
  success: null,
  emailSent: false,
  temporaryPassword: null,
};

function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add member"}
    </button>
  );
}

export default function AddMemberForm({ disabled = false }) {
  const [state, formAction] = useActionState(addMember, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="grid gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#29473f]">
          Member name <span className="font-normal text-neutral-500">(optional)</span>
          <input
            name="name"
            type="text"
            maxLength={100}
            disabled={disabled}
            placeholder="Alex Morgan"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#29473f]">
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={320}
            disabled={disabled}
            placeholder="teammate@company.com"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <SubmitButton disabled={disabled} />
      </form>

      {state?.error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state?.success && (
        <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p>{state.success}</p>
          {state.temporaryPassword && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                Share this temporary password securely
              </p>
              <code className="mt-2 block break-all text-base font-bold text-[#163d34]">
                {state.temporaryPassword}
              </code>
              <p className="mt-2 text-xs leading-5 text-neutral-600">
                It is shown only in this response. The member must replace it at first sign-in.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
