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
        sm:w-[310px]
        lg:w-[330px]
      "
    >
      <Link
        href={`/library/${id}`}
        className="block outline-none"
      >
        {/* MEDIA */}

        <div
          className="
            relative
            aspect-video
            w-full
            overflow-hidden
            rounded-[20px]
            bg-slate-200
            shadow-sm
            ring-1
            ring-slate-900/5
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:shadow-xl
            group-hover:ring-emerald-500/20
            group-focus-within:ring-4
            group-focus-within:ring-emerald-300
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
              className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#e9f5f1] via-[#edf7f8] to-[#f4f7f6] text-slate-600 transition-opacity duration-500 ${
                previewActive &&
                previewReady
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-emerald-800 shadow-sm">
                ▶
              </div>

              <p className="mt-3 text-xs font-semibold">
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
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/25">
                <div className="flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Preview
                </div>
              </div>
            )}

          {/* SOUND BLOCKED */}

          {previewActive &&
            soundBlocked && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35">
                <button
                  type="button"
                  onClick={
                    handleManualPreviewPlay
                  }
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow-xl transition hover:bg-emerald-50"
                >
                  ▶ Play preview with sound
                </button>
              </div>
            )}

          {/* PREVIEW LABEL */}

          {previewActive &&
            previewReady &&
            !soundBlocked && (
              <div className="absolute bottom-3 right-3 z-20 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                Preview
              </div>
            )}

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent opacity-55 transition duration-300 group-hover:opacity-75" />

          {/* CATEGORY */}

          {category?.name && (
            <div className="absolute left-3 top-3 z-20 max-w-[60%] truncate rounded-full border border-white/20 bg-slate-950/55 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              {category.name}
            </div>
          )}

          {/* DURATION */}

          {durationMinutes && (
            <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {durationMinutes} min
            </div>
          )}

          {/* PLAY */}

          {!previewActive && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white pl-1 text-xl text-emerald-800 opacity-0 shadow-xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                ▶
              </div>
            </div>
          )}

          {/* CONTINUE */}

          {hasProgress &&
            !previewActive && (
              <div className="absolute bottom-3 left-3 z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 shadow">
                Continue
              </div>
            )}

          {/* PROGRESS */}

          {progressPercent !== null && (
            <div className="absolute bottom-0 left-0 right-0 z-30 h-1.5 bg-white/35">
              <div
                className="h-full rounded-r-full bg-emerald-400"
                style={{
                  width: `${safeProgress}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* DETAILS */}

        <div className="px-1 pt-3">
          <h3 className="truncate text-[15px] font-bold tracking-tight text-slate-900 transition group-hover:text-emerald-800">
            {title}
          </h3>

          <p className="mt-1 truncate text-[13px] font-medium text-slate-600">
            {instructor ||
              "MindSettle"}
          </p>

          {hasProgress && (
            <p className="mt-1.5 text-xs font-semibold text-emerald-800">
              {safeProgress}% watched
            </p>
          )}
        </div>
      </Link>

      {/* SHARE */}

      <div className="mt-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share ${title}`}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
          <span className="text-[11px] font-semibold text-emerald-700">
            {shareStatus}
          </span>
        )}
      </div>
    </article>
  );
}