"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = [
  {
    id: "forest-water",
    label: "Forest water",
    title: "Flowing through the forest",
    description: "A soft current over stone and moss.",
    src: "/media/forest-water.mp4",
  },
  {
    id: "gentle-stream",
    label: "Gentle stream",
    title: "A quiet woodland stream",
    description: "Slow water moving beneath the trees.",
    src: "/media/gentle-stream.mp4",
  },
  {
    id: "rain-on-leaves",
    label: "Soft rain",
    title: "Rain resting on leaves",
    description: "A close, unhurried moment in nature.",
    src: "/media/rain-on-leaves.mp4",
  },
];

export default function CalmingMediaPreview() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const scene = SCENES[sceneIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      videoRef.current?.pause();
    }

    function followMotionPreference(event) {
      if (!event.matches) return;
      videoRef.current?.pause();
    }

    mediaQuery.addEventListener("change", followMotionPreference);
    return () => mediaQuery.removeEventListener("change", followMotionPreference);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  }

  async function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      return;
    }

    audio.volume = 0.35;
    try {
      await audio.play();
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  }

  function selectScene(index) {
    setSceneIndex(index);
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#0b2d26] shadow-2xl">
      <video
        key={scene.src}
        ref={videoRef}
        autoPlay={isPlaying}
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-forest-stream.jpg"
        aria-label={scene.title}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={scene.src} type="video/mp4" />
        Your browser does not support background video.
      </video>

      <audio ref={audioRef} src="/media/flowing-water.mp3" loop preload="none" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,28,23,.08)_28%,rgba(5,28,23,.82)_100%)]" />

      <div className="absolute right-5 top-5 flex gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause calming video" : "Play calming video"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-[#0b2d26]/75 px-4 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-[#0b2d26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn off relaxing water sound" : "Turn on relaxing water sound"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-[#0b2d26]/75 px-4 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-[#0b2d26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">{soundOn ? "♪" : "♩"}</span>
          <span>{soundOn ? "Sound on" : "Add sound"}</span>
        </button>
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#0b2d26]/80 p-5 backdrop-blur-lg sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/65">Calming scene</p>
        <div className="mt-2" aria-live="polite">
          <p className="text-lg font-medium text-white">{scene.title}</p>
          <p className="mt-1 text-sm text-emerald-50/65">{scene.description}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Choose a calming scene">
          {SCENES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectScene(index)}
              aria-pressed={index === sceneIndex}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                index === sceneIndex
                  ? "border-[#d7f2ad] bg-[#d7f2ad] text-[#163d34]"
                  : "border-white/20 bg-white/5 text-white hover:bg-white/15"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
