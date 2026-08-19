"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import homeGoldCoastSunrise from "@/public/home-gold-coast-sunrise.jpg";

export default function HeroWaterBackground() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    function followMotionPreference(event) {
      if (!event.matches) return;
      videoRef.current?.pause();
    }

    if (motionPreference.matches) {
      videoRef.current?.pause();
    }

    motionPreference.addEventListener("change", followMotionPreference);
    return () => motionPreference.removeEventListener("change", followMotionPreference);
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

  return (
    <>
      <Image
        src={homeGoldCoastSunrise}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center"
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={homeGoldCoastSunrise.src}
        aria-hidden="true"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
      >
        <source src="/media/pexels-ocean-sunrise.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause ocean background" : "Play ocean background"}
        className="absolute right-5 top-28 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-[#183c48]/65 px-4 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-[#183c48]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:hidden sm:right-8 lg:right-10"
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        <span>{isPlaying ? "Pause scene" : "Play scene"}</span>
      </button>
    </>
  );
}
