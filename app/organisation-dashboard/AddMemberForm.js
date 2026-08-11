"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addMember } from "./actions";

const initialState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
    >
      {pending ? "Adding..." : "Add member"}
    </button>
  );
}

export default function AddMemberForm() {
  const [state, formAction] = useActionState(addMember, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="member-email" className="sr-only">
          Member email
        </label>
        <input
          id="member-email"
          name="email"
          type="email"
          required
          placeholder="teammate@company.com"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        {state?.error && (
          <p className="mt-1.5 text-sm text-red-600">{state.error}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
