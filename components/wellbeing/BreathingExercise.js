"use client";

import { useEffect, useState } from "react";

const PHASES = {
  ready: { label: "Ready when you are", seconds: 4 },
  inhale: { label: "Breathe in", seconds: 4 },
  exhale: { label: "Breathe out", seconds: 6 },
  complete: { label: "Nicely done", seconds: 0 },
};

export default function BreathingExercise() {
  const [phase, setPhase] = useState("ready");
  const [remaining, setRemaining] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(() => {
      if (remaining > 1) {
        setRemaining(remaining - 1);
        return;
      }

      if (phase === "inhale") {
        setPhase("exhale");
        setRemaining(PHASES.exhale.seconds);
        return;
      }

      if (cycle >= 5) {
        setPhase("complete");
        setRemaining(0);
        setActive(false);
        return;
      }

      setCycle(cycle + 1);
      setPhase("inhale");
      setRemaining(PHASES.inhale.seconds);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [active, cycle, phase, remaining]);

  function startOrPause() {
    if (phase === "ready" || phase === "complete") {
      setPhase("inhale");
      setRemaining(PHASES.inhale.seconds);
      setCycle(1);
      setActive(true);
      return;
    }
    setActive((value) => !value);
  }

  function reset() {
    setActive(false);
    setPhase("ready");
    setRemaining(PHASES.ready.seconds);
    setCycle(1);
  }

  const circleClass = phase === "inhale" ? "scale-125 duration-[4000ms]" : phase === "exhale" ? "scale-75 duration-[6000ms]" : "scale-90 duration-700";

  return (
    <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
      <div>
        <p className="eyebrow !text-[#a35f4e]">For moments of stress</p>
        <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#2f3a3e] sm:text-5xl">When everything feels like a lot, start with one breath.</h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#58666a]">Stress and anxious feelings can make the moment feel crowded. This short guide offers one simple point of focus: breathe in gently for four seconds, then breathe out slowly for six.</p>
        <p className="mt-5 text-sm leading-6 text-[#788184]">This is a wellbeing exercise, not medical care. Breathe normally or stop if you feel uncomfortable.</p>
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-[#344d5a] p-7 shadow-[0_24px_70px_rgba(49,56,59,.18)] sm:p-10">
        <div className="relative mx-auto flex aspect-square max-w-[340px] items-center justify-center">
          <div className={`absolute h-52 w-52 rounded-full bg-[#a9c9d2]/30 blur-2xl transition-transform ease-in-out motion-reduce:transform-none ${circleClass}`} />
          <div className={`absolute h-48 w-48 rounded-full border border-[#f0bfa8]/70 bg-[#d99b7d]/20 transition-transform ease-in-out motion-reduce:transform-none ${circleClass}`} />
          <div className="relative z-10 text-center" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f2c8b6]">{PHASES[phase].label}</p>
            <p className="mt-2 text-6xl font-light tabular-nums text-white">{phase === "ready" ? "·" : phase === "complete" ? "✓" : remaining}</p>
            <p className="mt-3 text-xs text-[#d4e0e3]/70">{phase === "complete" ? "Five rounds complete" : `Round ${cycle} of 5`}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" onClick={startOrPause} className="min-w-32 rounded-full bg-[#f3c5ad] px-6 py-3 text-sm font-semibold text-[#34434a] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{phase === "ready" || phase === "complete" ? "Begin" : active ? "Pause" : "Continue"}</button>
          {phase !== "ready" && <button type="button" onClick={reset} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Reset</button>}
        </div>
      </div>
    </div>
  );
}
