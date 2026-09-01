"use client";

import { useFormStatus } from "react-dom";

export default function CancelSubscriptionButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm("Stop this subscription from renewing? Paid access, including organisation member access, will continue until the current billing period ends.")) {
          event.preventDefault();
        }
      }}
      className="inline-flex rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Cancelling…" : "Cancel subscription"}
    </button>
  );
}
