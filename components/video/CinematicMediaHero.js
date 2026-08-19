"use client";

import { useState } from "react";
import VideoPlayer from "@/components/video/VideoPlayer";

export default function CinematicMediaHero({
  video,
  playlist = [],
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative isolate overflow-hidden rounded-[30px] px-5 py-8 sm:px-8 lg:px-12">
        {video.thumbnailUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[30px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 object-cover blur-[55px]"
            />

            <div className="absolute inset-0 bg-[#f5f5ed]/45" />
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-[1080px] overflow-hidden rounded-[22px] bg-black shadow-[0_30px_90px_rgba(18,55,47,0.28)]">
          <VideoPlayer
            key={video.id}
            initialMedia={{
              id: video.id,
              src: video.src,
              poster: video.thumbnailUrl,
              title: video.title,
              instructor: video.instructor,
              durationMinutes: video.durationMinutes,
            }}
            playlist={playlist}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden rounded-[30px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      {/* SAME POSTER, FADED BEHIND */}
      {video.thumbnailUrl && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[30px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnailUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-[28px] saturate-125 brightness-75"
          />

          <div className="absolute inset-0 bg-[#12372f]/15" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#f5f5ed]/35" />
        </div>
      )}

      {/* FLOATING CARD */}
      <div className="relative z-10 mx-auto h-[360px] w-full max-w-[1080px] overflow-hidden rounded-[22px] bg-[#12372f] shadow-[0_38px_95px_rgba(18,55,47,0.38)] sm:h-[390px] lg:h-[420px]">
        {video.thumbnailUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/30 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/10 to-transparent" />
          </>
        )}

        <div className="relative z-10 flex h-full items-end px-6 pb-7 sm:px-8 sm:pb-8 lg:px-10 lg:pb-9">
          <div className="max-w-[600px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d7f2ad]">
              MindSettle session
            </p>

            <h1 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[36px]">
              {video.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] font-medium text-white/75">
              <span>{video.instructor || "MindSettle"}</span>

              {video.durationMinutes && (
                <>
                  <span className="text-white/40">•</span>
                  <span>{video.durationMinutes} min</span>
                </>
              )}

              {video.category && (
                <>
                  <span className="text-white/40">•</span>
                  <span>{video.category}</span>
                </>
              )}
            </div>

            {video.description && (
              <p className="mt-3 line-clamp-2 max-w-[560px] text-[14px] leading-6 text-white/75">
                {video.description}
              </p>
            )}

            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#163d34] shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#d7f2ad]"
            >
              <span>▶</span>
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
