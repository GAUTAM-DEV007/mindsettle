"use client";

import { useState } from "react";
import BreathingExercise from "@/components/wellbeing/BreathingExercise";

export default function MoodResetBreathing() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-4 rounded-[22px] border border-[#cfd8cb] bg-[#fffdfa]/85 px-5 py-4 text-left shadow-[0_8px_22px_rgba(18,55,47,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#9bb98a] hover:bg-[#eef3e8] hover:shadow-[0_14px_30px_rgba(18,55,47,0.10)]"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78906f]">
            One calm moment
          </p>

          <p className="mt-1 text-base font-semibold text-[#163d34]">
            Reset your mood
          </p>

          <p className="mt-1 text-xs leading-5 text-[#5a6d66]">
            Take a short guided breathing reset.
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#163d34] text-lg text-white transition-transform group-hover:rotate-[-20deg]">
          ↻
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] overflow-y-auto bg-[#12372f]/35 px-4 py-8 backdrop-blur-lg"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="relative mx-auto w-full max-w-4xl rounded-[28px] bg-[#f5f5ed] p-5 shadow-[0_30px_100px_rgba(18,55,47,0.30)] sm:p-7"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#163d34] text-xl text-white"
              aria-label="Close breathing reset"
            >
              ×
            </button>

            <BreathingExercise />
          </div>
        </div>
      )}
    </>
  );
}
