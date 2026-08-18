"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const PREVIEW_DELAY_MS = 650;
const MAX_PREVIEW_SECONDS = 60;

export default function VideoCard({
  video,
  progressPercent = null,
}) {
  const {
    id,
    title,
    instructor,
    durationMinutes,
    thumbnailUrl,
    previewUrl,
    category,
    locked,
  } = video;

  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const [previewActive, setPreviewActive] =
    useState(false);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewReady, setPreviewReady] =
    useState(false);

  const [soundBlocked, setSoundBlocked] =
    useState(false);

  const [shareStatus, setShareStatus] =
    useState("");

  const hasProgress =
    progressPercent !== null &&
    progressPercent > 0;

  const safeProgress =
    progressPercent !== null
      ? Math.min(
          Math.max(progressPercent, 0),
          100
        )
      : 0;

  useEffect(() => {
    if (!previewActive) {
      return;
    }

    const preview =
      videoRef.current;

    if (!preview) {
      return;
    }

    preview.currentTime = 0;
    preview.muted = false;
    preview.volume = 1;

    async function startPreview() {
      try {
        await preview.play();
        setSoundBlocked(false);
      } catch (error) {
        console.log(
          "Browser blocked hover autoplay with sound:",
          error
        );

        preview.pause();
        setPreviewLoading(false);
        setPreviewReady(true);
        setSoundBlocked(true);
      }
    }

    startPreview();
  }, [previewActive]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        window.clearTimeout(
          hoverTimerRef.current
        );
      }
    };
  }, []);

  function handlePointerEnter(event) {
    if (
      event.pointerType === "touch"
    ) {
      return;
    }

    if (!previewUrl) {
      return;
    }

    if (hoverTimerRef.current) {
      window.clearTimeout(
        hoverTimerRef.current
      );
    }

    hoverTimerRef.current =
      window.setTimeout(() => {
        setPreviewLoading(true);
        setPreviewReady(false);
        setSoundBlocked(false);
        setPreviewActive(true);
      }, PREVIEW_DELAY_MS);
  }

  function stopPreview() {
    if (hoverTimerRef.current) {
      window.clearTimeout(
        hoverTimerRef.current
      );

      hoverTimerRef.current = null;
    }

    const preview =
      videoRef.current;

    if (preview) {
      preview.pause();

      try {
        preview.currentTime = 0;
      } catch {
        // Ignore reset errors.
      }
    }

    setPreviewActive(false);
    setPreviewLoading(false);
    setPreviewReady(false);
    setSoundBlocked(false);
  }

  function handlePreviewPlaying() {
    setPreviewLoading(false);
    setPreviewReady(true);
    setSoundBlocked(false);
  }

  function handlePreviewWaiting() {
    setPreviewLoading(true);
  }

  function handlePreviewTimeUpdate(
    event
  ) {
    if (
      event.currentTarget.currentTime >=
      MAX_PREVIEW_SECONDS
    ) {
      stopPreview();
    }
  }

  async function handleManualPreviewPlay(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    const preview =
      videoRef.current;

    if (!preview) {
      return;
    }

    try {
      preview.muted = false;
      preview.volume = 1;

      await preview.play();

      setSoundBlocked(false);
      setPreviewReady(true);
      setPreviewLoading(false);
    } catch (error) {
      console.error(
        "Could not start preview with sound:",
        error
      );
    }
  }

  async function handleShare() {
    const shareUrl =
      `${window.location.origin}/library/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Watch "${title}" on MindSettle.`,
          url: shareUrl,
        });

        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareStatus(
          "Link copied"
        );
      }
    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        try {
          await navigator.clipboard.writeText(
            shareUrl
          );

          setShareStatus(
            "Link copied"
          );
        } catch {
          setShareStatus(
            "Could not share"
          );
        }
      }
    }

    window.setTimeout(() => {
      setShareStatus("");
    }, 2200);
  }

  return (
    <article
      onPointerEnter={
        handlePointerEnter
      }
      onPointerLeave={
        stopPreview
      }
      className="
        group
        relative
        w-[270px]
        shrink-0
        rounded-[24px]
        border
        border-[#dfe5dc]
        bg-[#fffdfa]
        p-2.5
        shadow-[0_8px_24px_rgba(18,55,47,0.05)]
        transition-all
        duration-300
        sm:w-[310px]
        lg:w-[330px]

        hover:-translate-y-0.5
        hover:border-[#9bb98a]
        hover:shadow-[0_16px_34px_rgba(18,55,47,0.10)]
      "
    >
      <Link
        href={`/library/${id}`}
        className="block rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-[#9bb98a]"
      >
        {/* MEDIA */}

        <div
          className="
            relative
            aspect-video
            w-full
            overflow-hidden
            rounded-[18px]
            bg-[#dfe8d6]
            shadow-sm
            ring-1
            ring-[#dfe5dc]
            transition-all
            duration-300

            group-hover:ring-[#9bb98a]
          "
        >
          {/* THUMBNAIL */}

          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={`${title} thumbnail`}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                previewActive &&
                previewReady
                  ? "scale-[1.02] opacity-0"
                  : "opacity-100 group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div
              className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#dfe8d6] via-[#eef3e8] to-[#f5f5ed] text-[#5a6d66] transition-opacity duration-500 ${
                previewActive &&
                previewReady
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fffdfa] text-xl text-[#163d34] shadow-[0_8px_20px_rgba(18,55,47,0.10)]">
                ▶
              </div>

              <p className="mt-3 text-xs font-semibold text-[#163d34]">
                MindSettle
              </p>
            </div>
          )}

          {/* PREVIEW */}

          {previewActive &&
            previewUrl && (
              <video
                ref={videoRef}
                src={previewUrl}
                playsInline
                preload="metadata"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noremoteplayback"
                onContextMenu={(event) =>
                  event.preventDefault()
                }
                onPlaying={
                  handlePreviewPlaying
                }
                onWaiting={
                  handlePreviewWaiting
                }
                onTimeUpdate={
                  handlePreviewTimeUpdate
                }
                onEnded={
                  stopPreview
                }
                onError={
                  stopPreview
                }
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  previewReady
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            )}

          {/* LOADING */}

          {previewActive &&
            previewLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#12372f]/30">
                <div className="flex items-center gap-2 rounded-full bg-[#12372f]/85 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Preview
                </div>
              </div>
            )}

          {/* SOUND BLOCKED */}

          {previewActive &&
            soundBlocked && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#12372f]/40">
                <button
                  type="button"
                  onClick={
                    handleManualPreviewPlay
                  }
                  className="flex items-center gap-2 rounded-full bg-[#d7f2ad] px-4 py-2 text-xs font-semibold text-[#12372f] shadow-xl transition hover:bg-white"
                >
                  ▶ Play preview with sound
                </button>
              </div>
            )}

          {/* PREVIEW LABEL */}

          {previewActive &&
            previewReady &&
            !soundBlocked && (
              <div className="absolute bottom-3 right-3 z-20 rounded-full bg-[#12372f]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                Preview
              </div>
            )}

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#12372f]/70 via-transparent to-transparent opacity-50 transition duration-300 group-hover:opacity-70" />

          {/* CATEGORY */}

          {category?.name && (
            <div className="absolute left-3 top-3 z-20 max-w-[60%] truncate rounded-full border border-white/20 bg-[#12372f]/65 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              {category.name}
            </div>
          )}

          {/* DURATION */}

          {durationMinutes && (
            <div className="absolute right-3 top-3 z-20 rounded-full bg-[#12372f]/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {durationMinutes} min
            </div>
          )}

          {/* LOCKED */}

          {locked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#12372f]/45">
              <div className="flex items-center gap-1.5 rounded-full bg-[#fffdfa]/95 px-3 py-1.5 text-[11px] font-semibold text-[#163d34] shadow">
                🔒 Subscribers only
              </div>
            </div>
          )}

          {/* PLAY */}

          {!previewActive && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-[#d7f2ad] pl-1 text-xl text-[#12372f] opacity-0 shadow-[0_10px_28px_rgba(18,55,47,0.18)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                ▶
              </div>
            </div>
          )}

          {/* CONTINUE */}

          {hasProgress &&
            !previewActive && (
              <div className="absolute bottom-3 left-3 z-20 rounded-full bg-[#fffdfa]/95 px-3 py-1 text-[11px] font-semibold text-[#163d34] shadow">
                Continue
              </div>
            )}

          {/* PROGRESS */}

          {progressPercent !== null && (
            <div className="absolute bottom-0 left-0 right-0 z-30 h-1.5 bg-white/35">
              <div
                className="h-full rounded-r-full bg-[#d7f2ad]"
                style={{
                  width: `${safeProgress}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* DETAILS */}

        <div className="px-1 pb-1 pt-4">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[#163d34] transition group-hover:text-[#12372f]">
            {title}
          </h3>

          <p className="mt-1 truncate text-[13px] font-medium text-[#5a6d66]">
            {instructor ||
              "MindSettle"}
          </p>

          {hasProgress && (
            <p className="mt-1.5 text-xs font-semibold text-[#78906f]">
              {safeProgress}% watched
            </p>
          )}
        </div>
      </Link>

      {/* SHARE */}

      <div className="mt-2 flex items-center justify-between border-t border-[#dfe5dc] px-1 pt-2">
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share ${title}`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#5a6d66] transition hover:bg-[#eef3e8] hover:text-[#163d34] focus:outline-none focus:ring-2 focus:ring-[#9bb98a]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="5"
              r="3"
            />
            <circle
              cx="6"
              cy="12"
              r="3"
            />
            <circle
              cx="18"
              cy="19"
              r="3"
            />
            <path d="m8.6 10.5 6.8-4" />
            <path d="m8.6 13.5 6.8 4" />
          </svg>

          Share
        </button>

        {shareStatus && (
          <span className="text-[11px] font-semibold text-[#78906f]">
            {shareStatus}
          </span>
        )}
      </div>
    </article>
  );
}