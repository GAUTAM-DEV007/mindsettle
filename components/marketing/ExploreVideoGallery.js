"use client";

import { useRef, useState } from "react";

const VIDEOS = [
  {
    id: "waterfall",
    title: "Stillness in motion",
    description: "An autumn waterfall moves gently through rock, shadow and warm forest colour.",
    src: "/media/pexels-autumn-waterfall.mp4",
    duration: "Waterfall · Quiet preview",
    credit: "K",
    href: "https://www.pexels.com/video/slow-motion-of-waterfall-in-forest-10255436/",
    featured: true,
  },
  {
    id: "reef",
    title: "Below the surface",
    description: "Tropical fish drift across a living reef in clear blue water.",
    src: "/media/pexels-coral-fish.mp4",
    duration: "Coral reef · Quiet preview",
    credit: "Alex Mesel",
    href: "https://www.pexels.com/video/underwater-footage-of-tropical-fish-in-a-coral-reef-11273418/",
  },
  {
    id: "mist",
    title: "Where the mist settles",
    description: "Morning mist lifts slowly from a quiet lake edged with reeds and trees.",
    src: "/media/pexels-mist-lake.mp4",
    duration: "Misty lake · Quiet preview",
    credit: "leon labuschagne",
    href: "https://www.pexels.com/video/mist-on-lake-7689775/",
  },
];

export default function ExploreVideoGallery() {
  const videoRefs = useRef(new Map());
  const [playingId, setPlayingId] = useState(null);

  async function togglePlayback(id) {
    const selectedVideo = videoRefs.current.get(id);
    if (!selectedVideo) return;

    if (!selectedVideo.paused) {
      selectedVideo.pause();
      setPlayingId(null);
      return;
    }

    for (const [otherId, video] of videoRefs.current) {
      if (otherId !== id) video.pause();
    }

    try {
      await selectedVideo.play();
      setPlayingId(id);
    } catch {
      setPlayingId(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {VIDEOS.map((video) => {
        const isPlaying = playingId === video.id;

        return (
          <article
            key={video.id}
            className={`group relative min-h-[25rem] overflow-hidden rounded-[2.25rem] bg-[#173c45] shadow-[0_22px_60px_rgba(24,53,61,.14)] ${
              video.featured ? "lg:row-span-2 lg:min-h-[53rem]" : ""
            }`}
          >
            <video
              ref={(element) => {
                if (element) videoRefs.current.set(video.id, element);
                else videoRefs.current.delete(video.id);
              }}
              src={video.src}
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPlayingId(video.id)}
              onPause={() => setPlayingId((current) => (current === video.id ? null : current))}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.015]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,35,42,.06)_24%,rgba(12,35,42,.86)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d9e9df]">
                {video.duration}
              </p>
              <div className="mt-3 flex items-end justify-between gap-5">
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-.035em]">{video.title}</h3>
                  <p className="mt-2 max-w-xl leading-7 text-white/80">{video.description}</p>
                  <a
                    href={video.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-[#f4d0bb] underline decoration-white/30 underline-offset-4 transition hover:text-white"
                  >
                    Footage by {video.credit} on Pexels <span className="ml-1" aria-hidden="true">↗</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => togglePlayback(video.id)}
                  aria-label={`${isPlaying ? "Pause" : "Play"} ${video.title}`}
                  aria-pressed={isPlaying}
                  className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/90 text-xl text-[#173c45] shadow-xl backdrop-blur transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:size-16"
                >
                  <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
