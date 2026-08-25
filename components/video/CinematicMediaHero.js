"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import VideoPlayer from "@/components/video/VideoPlayer";

function formatDuration(
  durationSeconds,
  durationMinutes
) {
  const exactSeconds =
    Number(
      durationSeconds
    );

  if (
    Number.isFinite(
      exactSeconds
    ) &&
    exactSeconds > 0
  ) {
    const totalSeconds =
      Math.round(
        exactSeconds
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      String(
        totalSeconds % 60
      ).padStart(
        2,
        "0"
      );

    return `${minutes}:${seconds}`;
  }

  const fallbackMinutes =
    Number(
      durationMinutes
    );

  if (
    Number.isFinite(
      fallbackMinutes
    ) &&
    fallbackMinutes > 0
  ) {
    return `${fallbackMinutes} min`;
  }

  return null;
}

export default function CinematicMediaHero({
  video,
  playlist = [],
  isFavourited = false,
  addFavouriteAction,
  removeFavouriteAction,
}) {
  const router =
    useRouter();

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const durationLabel =
    formatDuration(
      video.durationSeconds,
      video.durationMinutes
    );

  const favouriteAction =
    isFavourited
      ? removeFavouriteAction
      : addFavouriteAction;

  /* ======================================================
     PLAYING VIEW
  ====================================================== */

  if (playing) {
    return (
      <div className="relative isolate overflow-hidden rounded-[30px] px-3 py-5 sm:px-8 sm:py-8 lg:px-12">
        {video.thumbnailUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[30px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                video.thumbnailUrl
              }
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 object-cover blur-[55px]"
            />

            <div className="absolute inset-0 bg-[#f5f5ed]/45" />
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-[1080px] overflow-hidden rounded-[18px] bg-black shadow-[0_30px_90px_rgba(18,55,47,0.28)] sm:rounded-[22px]">
          <VideoPlayer
            key={video.id}
            initialMedia={{
              id:
                video.id,

              src:
                video.src,

              poster:
                video.thumbnailUrl,

              title:
                video.title,

              instructor:
                video.instructor,

              durationMinutes:
                video.durationMinutes,

              durationSeconds:
                video.durationSeconds,
            }}
            playlist={
              playlist
            }
            onMinimize={() => {
              router.back();
            }}
          />
        </div>
      </div>
    );
  }

  /* ======================================================
     CINEMATIC POSTER VIEW
  ====================================================== */

  return (
    <div className="relative isolate overflow-hidden rounded-[30px] px-3 py-5 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      {video.thumbnailUrl && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[30px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              video.thumbnailUrl
            }
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-[28px] saturate-125 brightness-75"
          />

          <div className="absolute inset-0 bg-[#12372f]/15" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#f5f5ed]/35" />
        </div>
      )}

      <div className="relative z-10 mx-auto h-[390px] w-full max-w-[1080px] overflow-hidden rounded-[22px] bg-[#12372f] shadow-[0_38px_95px_rgba(18,55,47,0.38)] sm:h-[410px] lg:h-[430px]">
        {video.thumbnailUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                video.thumbnailUrl
              }
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/5" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          </>
        )}

        <div className="relative z-10 flex h-full items-end px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-9">
          <div className="w-full max-w-[620px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#d7f2ad] sm:text-[11px]">
              MindSettle session
            </p>

            <h1 className="mt-2 text-[26px] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[32px] lg:text-[36px]">
              {video.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-medium text-white/75 sm:text-[14px]">
              <span>
                {video.instructor ||
                  "MindSettle"}
              </span>

              {durationLabel && (
                <>
                  <span className="text-white/40">
                    •
                  </span>

                  <span>
                    {durationLabel}
                  </span>
                </>
              )}

              {video.category && (
                <>
                  <span className="text-white/40">
                    •
                  </span>

                  <span>
                    {video.category}
                  </span>
                </>
              )}
            </div>

            {video.description && (
              <p className="mt-3 line-clamp-2 max-w-[560px] text-[13px] leading-5 text-white/75 sm:text-[14px] sm:leading-6">
                {video.description}
              </p>
            )}

            {/* ============================================
                PRIMARY ACTIONS
            ============================================ */}

            <div className="mt-5 flex flex-col gap-2.5 min-[440px]:flex-row min-[440px]:items-center">
              <button
                type="button"
                onClick={() => {
                  setPlaying(
                    true
                  );
                }}
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-[14px]
                  font-semibold
                  text-[#163d34]
                  shadow-[0_10px_28px_rgba(0,0,0,0.22)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#d7f2ad]
                "
              >
                <span aria-hidden="true">
                  ▶
                </span>

                Play
              </button>

              {favouriteAction && (
                <form
                  action={
                    favouriteAction
                  }
                  className="contents"
                >
                  <input
                    type="hidden"
                    name="videoId"
                    value={
                      video.id
                    }
                  />

                  <input
                    type="hidden"
                    name="redirectPath"
                    value={`/library/${video.id}`}
                  />

                  <button
                    type="submit"
                    aria-pressed={
                      isFavourited
                    }
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-white/35
                      bg-black/25
                      px-6
                      py-3
                      text-[14px]
                      font-semibold
                      text-white
                      backdrop-blur-md
                      transition-all
                      hover:-translate-y-0.5
                      hover:border-white/60
                      hover:bg-black/40
                    "
                  >
                    <span aria-hidden="true">
                      {isFavourited
                        ? "♥"
                        : "♡"}
                    </span>

                    {isFavourited
                      ? "Favourited"
                      : "Favourite"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
