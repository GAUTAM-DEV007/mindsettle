"use client";

import { useEffect, useRef, useState } from "react";

const BOX_PHASES = [
  {
    id: "inhale",
    label: "Inhale",
    instruction: "Breathe in slowly",
    seconds: 4,
    soundType: "breath",
    breathId: "inhale",
    toneLabel: "Natural human inhale",
  },
  {
    id: "hold-in",
    label: "Hold",
    instruction: "Hold gently",
    seconds: 4,
    startFrequency: 392,
    endFrequency: 369.99,
    filterStart: 1320,
    filterEnd: 1040,
    peakGain: 0.027,
    attack: 0.16,
    release: 0.8,
    cueDuration: 1.45,
    toneShape: "bell",
    toneLabel: "Quiet hold cue",
  },
  {
    id: "exhale",
    label: "Exhale",
    instruction: "Breathe out slowly",
    seconds: 4,
    soundType: "breath",
    breathId: "exhale",
    toneLabel: "Natural human exhale",
  },
  {
    id: "hold-out",
    label: "Hold",
    instruction: "Rest before the next breath",
    seconds: 4,
    startFrequency: 174.61,
    endFrequency: 164.81,
    filterStart: 720,
    filterEnd: 520,
    peakGain: 0.029,
    attack: 0.2,
    release: 0.9,
    cueDuration: 1.5,
    toneShape: "bell",
    toneLabel: "Quiet reset cue",
  },
];

const COMPLETION_TONE = {
  seconds: 2.2,
  startFrequency: 261.63,
  endFrequency: 392,
  filterStart: 920,
  filterEnd: 1500,
  peakGain: 0.035,
  attack: 0.22,
  release: 1.15,
  toneShape: "bell",
};

const TONE_LAYERS = [
  { ratio: 1, level: 1, detune: -3 },
  { ratio: 1.5, level: 0.2, detune: 2 },
  { ratio: 2, level: 0.075, detune: 5 },
];

const HUMAN_BREATHS = {
  inhale: {
    playbackRate: 0.58,
    volume: 0.58,
  },
  exhale: {
    playbackRate: 0.84,
    volume: 0.52,
  },
};

const TOTAL_ROUNDS = 4;

export default function BreathingExercise() {
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [remaining, setRemaining] = useState(4);
  const [round, setRound] = useState(1);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);
  const audioGraphRef = useRef(null);
  const activeToneRef = useRef(null);
  const inhaleAudioRef = useRef(null);
  const exhaleAudioRef = useRef(null);
  const activeBreathRef = useRef(null);

  const phase = phaseIndex >= 0 ? BOX_PHASES[phaseIndex] : null;

  function createReverbImpulse(context) {
    const duration = 1.75;
    const length = Math.floor(context.sampleRate * duration);
    const impulse = context.createBuffer(2, length, context.sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        const decay = Math.pow(1 - index / length, 2.8);
        data[index] = (Math.random() * 2 - 1) * decay;
      }
    }

    return impulse;
  }

  function createAudioGraph(context) {
    const input = context.createGain();
    const dry = context.createGain();
    const convolver = context.createConvolver();
    const wet = context.createGain();
    const output = context.createGain();

    dry.gain.value = 0.82;
    wet.gain.value = 0.14;
    output.gain.value = 0.82;
    convolver.buffer = createReverbImpulse(context);

    input.connect(dry);
    input.connect(convolver);
    dry.connect(output);
    convolver.connect(wet);
    wet.connect(output);
    output.connect(context.destination);

    return { input, dry, convolver, wet, output };
  }

  function prepareAudio(force = false) {
    if ((!soundEnabled && !force) || typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        audioGraphRef.current = createAudioGraph(audioContextRef.current);
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }

    return audioContextRef.current;
  }

  function stopActiveTone() {
    const tone = activeToneRef.current;
    if (!tone) return;

    const now = tone.context.currentTime;
    try {
      tone.gain.gain.cancelScheduledValues(now);
      tone.gain.gain.setValueAtTime(
        Math.max(tone.gain.gain.value, 0.0001),
        now
      );
      tone.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      tone.oscillators.forEach((oscillator) => oscillator.stop(now + 0.09));
    } catch {}

    activeToneRef.current = null;
  }

  function stopActiveBreath() {
    const activeBreath = activeBreathRef.current;
    if (!activeBreath) return;

    if (activeBreath.onReady) {
      activeBreath.audio.removeEventListener(
        "loadedmetadata",
        activeBreath.onReady
      );
    }

    activeBreath.audio.pause();
    try {
      activeBreath.audio.currentTime = 0;
    } catch {}
    activeBreathRef.current = null;
  }

  function playHumanBreath(tonePhase, duration = 4, force = false) {
    if ((!soundEnabled && !force) || typeof window === "undefined") return;

    const audio =
      tonePhase.breathId === "inhale"
        ? inhaleAudioRef.current
        : exhaleAudioRef.current;
    const settings = HUMAN_BREATHS[tonePhase.breathId];
    if (!audio || !settings) return;

    stopActiveTone();
    stopActiveBreath();

    const elapsed = Math.max(0, tonePhase.seconds - duration);
    const token = Symbol(tonePhase.breathId);

    const startPlayback = () => {
      if (activeBreathRef.current?.token !== token) return;

      audio.playbackRate = settings.playbackRate;
      audio.volume = settings.volume;
      audio.preservesPitch = true;
      audio.currentTime = Math.min(
        Math.max(0, audio.duration - 0.08),
        elapsed * settings.playbackRate
      );
      audio.play().catch(() => {});
    };

    activeBreathRef.current = {
      audio,
      token,
      onReady: audio.readyState >= 1 ? null : startPlayback,
    };

    audio.onended = () => {
      if (activeBreathRef.current?.token === token) {
        activeBreathRef.current = null;
      }
    };

    if (audio.readyState >= 1) {
      startPlayback();
    } else {
      audio.addEventListener("loadedmetadata", startPlayback, { once: true });
      audio.load();
    }
  }

  function playPhaseSound(tonePhase, duration = 4, force = false) {
    if (tonePhase.soundType === "breath") {
      playHumanBreath(tonePhase, duration, force);
      return;
    }

    stopActiveBreath();
    playGuidanceTone(
      tonePhase,
      Math.min(duration, tonePhase.cueDuration || duration),
      force
    );
  }

  function stopPhaseSound() {
    stopActiveTone();
    stopActiveBreath();
  }

  function playGuidanceTone(tonePhase, duration = 4, force = false) {
    const context = prepareAudio(force);
    if (!context) return;

    stopActiveTone();

    const graph = audioGraphRef.current;
    if (!graph) return;

    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const now = context.currentTime;
    const safeDuration = Math.max(duration, 0.35);
    const fullDuration = tonePhase.seconds || 4;
    const elapsedFraction = Math.max(0, 1 - safeDuration / fullDuration);
    const startFrequency = Math.exp(
      Math.log(tonePhase.startFrequency) +
        (Math.log(tonePhase.endFrequency) -
          Math.log(tonePhase.startFrequency)) *
          elapsedFraction
    );

    const endFrequency = tonePhase.endFrequency || startFrequency;
    const filterStart = tonePhase.filterStart || 900;
    const filterEnd = tonePhase.filterEnd || filterStart;
    const attack = Math.min(tonePhase.attack || 0.35, safeDuration * 0.35);
    const release = Math.min(tonePhase.release || 0.8, safeDuration * 0.45);
    const peakTime = now + attack;
    const releaseTime = Math.max(peakTime + 0.02, now + safeDuration - release);
    const peakGain = tonePhase.peakGain || 0.03;

    filter.type = "lowpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(filterStart, now);
    filter.frequency.exponentialRampToValueAtTime(filterEnd, now + safeDuration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, peakTime);
    gain.gain.exponentialRampToValueAtTime(
      tonePhase.toneShape === "bell" ? peakGain * 0.32 : peakGain * 0.82,
      releaseTime
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + safeDuration);

    const oscillators = TONE_LAYERS.map((layer, index) => {
      const oscillator = context.createOscillator();
      const layerGain = context.createGain();

      oscillator.type = index === 2 ? "triangle" : "sine";
      oscillator.detune.value = layer.detune;
      oscillator.frequency.setValueAtTime(startFrequency * layer.ratio, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency * layer.ratio,
        now + safeDuration
      );
      layerGain.gain.value = layer.level;

      oscillator.connect(layerGain);
      layerGain.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + safeDuration + 0.04);

      return oscillator;
    });

    filter.connect(gain);
    gain.connect(graph.input);

    const currentTone = { context, oscillators, gain, filter };
    activeToneRef.current = currentTone;

    oscillators.at(-1).onended = () => {
      oscillators.forEach((oscillator) => oscillator.disconnect());
      filter.disconnect();
      gain.disconnect();
      if (activeToneRef.current === currentTone) activeToneRef.current = null;
    };
  }

  useEffect(() => {
    if (!active || !phase) return;

    const timer = window.setTimeout(() => {
      if (remaining > 1) {
        setRemaining((value) => value - 1);
        return;
      }

      const isLastPhase = phaseIndex === BOX_PHASES.length - 1;

      if (isLastPhase && round >= TOTAL_ROUNDS) {
        setComplete(true);
        setActive(false);
        setPhaseIndex(-1);
        setRemaining(0);
        playGuidanceTone(COMPLETION_TONE, COMPLETION_TONE.seconds);
        return;
      }

      const nextPhaseIndex = isLastPhase ? 0 : phaseIndex + 1;
      if (isLastPhase) setRound((value) => value + 1);
      setPhaseIndex(nextPhaseIndex);
      setRemaining(BOX_PHASES[nextPhaseIndex].seconds);
      playPhaseSound(
        BOX_PHASES[nextPhaseIndex],
        BOX_PHASES[nextPhaseIndex].seconds
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [active, phase, phaseIndex, remaining, round, soundEnabled]);

  useEffect(() => {
    return () => {
      stopPhaseSound();
      if (audioGraphRef.current) {
        Object.values(audioGraphRef.current).forEach((node) => {
          try {
            node.disconnect();
          } catch {}
        });
      }
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  function startOrPause() {
    if (phaseIndex === -1) {
      setComplete(false);
      setPhaseIndex(0);
      setRemaining(BOX_PHASES[0].seconds);
      setRound(1);
      setActive(true);
      prepareAudio();
      playPhaseSound(BOX_PHASES[0], BOX_PHASES[0].seconds);
      return;
    }

    if (active) {
      setActive(false);
      stopPhaseSound();
      return;
    }

    setActive(true);
    prepareAudio();
    playPhaseSound(phase, remaining);
  }

  function reset() {
    setActive(false);
    setComplete(false);
    setPhaseIndex(-1);
    setRemaining(4);
    setRound(1);
    stopPhaseSound();
  }

  function toggleSound() {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);

    if (!nextValue) {
      stopPhaseSound();
      return;
    }

    if (active) {
      prepareAudio(true);
      if (phase) playPhaseSound(phase, remaining, true);
    }
  }

  const progressKey = `${phase?.id || "ready"}-${round}`;
  const elapsedSeconds = complete
    ? TOTAL_ROUNDS * BOX_PHASES.length * 4
    : phase
      ? (round - 1) * BOX_PHASES.length * 4 +
        phaseIndex * 4 +
        (phase.seconds - remaining)
      : 0;
  const totalSeconds = TOTAL_ROUNDS * BOX_PHASES.length * 4;
  const sessionProgress = Math.round((elapsedSeconds / totalSeconds) * 100);
  const orbPhase = complete ? "complete" : phase?.id || "ready";

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
      <div className="lg:pt-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#b58a78]/25 bg-white/45 px-4 py-2 text-[.68rem] font-bold uppercase tracking-[.18em] text-[#956957]">
          <span className="h-2 w-2 rounded-full bg-[#cf9d88]" />
          A one-minute reset
        </div>
        <h2 className="mt-6 max-w-xl text-balance text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-[#2b434a] sm:text-6xl">
          Let the rhythm do the thinking.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5e7072]">
          Box breathing moves through four equal, unhurried steps. Follow the
          orb and the optional human breath guide for four gentle rounds.
        </p>

        <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
          {BOX_PHASES.map((item, index) => (
            <div
              key={item.id}
              aria-current={phaseIndex === index ? "step" : undefined}
              className={`rounded-[1.35rem] border px-4 py-4 transition duration-500 ${
                phaseIndex === index
                  ? "border-white/90 bg-white/80 text-[#304d54] shadow-[0_12px_35px_rgba(68,84,87,.09)]"
                  : "border-white/55 bg-white/32 text-[#657678]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    phaseIndex === index ? "bg-[#c98f78]" : "bg-[#aebdbd]"
                  }`}
                />
                <p className="text-[.66rem] font-bold uppercase tracking-[.15em]">
                  {index + 1}. {item.label}
                </p>
              </div>
              <p className="mt-2 pl-[1.125rem] text-xs leading-5">
                4 seconds · {item.toneLabel}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 max-w-xl rounded-2xl border border-[#8fa3a3]/18 bg-[#f5f6f3]/55 px-5 py-4 text-sm leading-6 text-[#6b7879]">
          Keep each hold comfortable and never strain. Breathe normally or
          stop if the rhythm does not feel right for you.
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2.8rem] border border-white/75 bg-white/58 p-5 shadow-[0_30px_85px_rgba(62,81,84,.13)] backdrop-blur-sm sm:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e8d8e9]/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#efd2c4]/50 blur-3xl" />
        <audio
          ref={inhaleAudioRef}
          src="/audio/breathing/human-inhale.mp3"
          preload="auto"
          aria-hidden="true"
        />
        <audio
          ref={exhaleAudioRef}
          src="/audio/breathing/human-exhale.mp3"
          preload="auto"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-[#748586]">
                Guided practice
              </p>
              <p className="mt-1 text-sm font-semibold text-[#365158]">
                {complete
                  ? "Session complete"
                  : phase
                    ? `Round ${round} of ${TOTAL_ROUNDS}`
                    : "Four rounds · 64 seconds"}
              </p>
            </div>
            <span className="rounded-full border border-[#9badad]/25 bg-white/50 px-3 py-2 text-xs font-semibold text-[#587073]">
              {sessionProgress}%
            </span>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#b9c6c5]/25">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#8eb9bb,#c5b0cc,#d69f89)] transition-[width] duration-700"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>

          <div className="relative flex min-h-[22rem] items-center justify-center py-8 sm:min-h-[25rem]">
            <div className="absolute h-72 w-72 rounded-full border border-[#91a7a7]/15 sm:h-80 sm:w-80" />
            <div className="absolute h-60 w-60 rounded-full border border-white/65 bg-white/16 sm:h-72 sm:w-72" />
            <div
              key={progressKey}
              data-phase={orbPhase}
              className="breath-orb relative flex h-48 w-48 items-center justify-center rounded-full text-center sm:h-56 sm:w-56"
              style={{ animationPlayState: active || complete ? "running" : "paused" }}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="relative z-10 max-w-[10rem]">
                <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-[#526d72]">
                  {complete
                    ? "Nicely done"
                    : phase
                      ? phase.instruction
                      : "Ready when you are"}
                </p>
                <p className="mt-2 text-5xl font-light tabular-nums text-[#29464d]">
                  {complete ? "✓" : phase ? remaining : "○"}
                </p>
                <p className="mt-2 text-xs font-medium text-[#5e7678]">
                  {complete
                    ? "Four calm rounds"
                    : phase
                      ? phase.label
                      : "Press begin"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2" aria-label="Breathing cycle">
            {BOX_PHASES.map((item, index) => (
              <div
                key={item.id}
                className={`rounded-full px-2 py-2.5 text-center text-[.65rem] font-bold uppercase tracking-[.09em] transition ${
                  phaseIndex === index
                    ? "bg-[#2f5056] text-white shadow-[0_8px_20px_rgba(47,80,86,.18)]"
                    : "bg-white/45 text-[#718183]"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={startOrPause}
            className="min-w-32 rounded-full bg-[#2e4c53] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(46,76,83,.18)] transition hover:-translate-y-0.5 hover:bg-[#203e45] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2e4c53]"
          >
            {phaseIndex === -1 ? "Begin" : active ? "Pause" : "Continue"}
          </button>
          {(phaseIndex !== -1 || complete) && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-[#8da2a2]/30 bg-white/38 px-5 py-3.5 text-sm font-semibold text-[#405d62] transition hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#607b7e]"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            className="rounded-full border border-[#8da2a2]/30 bg-white/38 px-5 py-3.5 text-sm font-semibold text-[#405d62] transition hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#607b7e]"
          >
            <span aria-hidden="true">♪</span>{" "}
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
        </div>
        <p className="relative mt-4 text-center text-xs leading-5 text-[#758486]">
          Natural human breath audio guides the inhale and exhale. Hold cues
          stay soft and brief.
        </p>
      </div>
    </div>
  );
}
