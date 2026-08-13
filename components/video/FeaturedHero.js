"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const PREVIEW_DELAY_MS = 700;
const MAX_PREVIEW_SECONDS = 60;

export default function FeaturedHero({
  featured,
}) {
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const [previewActive, setPreviewActive] =
    useState(false);

  const [previewReady, setPreviewReady] =
    useState(false);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [soundBlocked, setSoundBlocked] =
    useState(false);

  useEffect(() => {
    if (!previewActive) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    async function startPreview() {
      try {
        await video.play();

        setPreviewReady(true);
        setPreviewLoading(false);
        setSoundBlocked(false);
      } catch (error) {
        console.log(
          "Hero autoplay with sound was blocked:",
          error
        );

        video.pause();

        setPreviewReady(false);
        setPreviewLoading(false);
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

  if (!featured) {
    return null;
  }

  function handlePointerEnter(event) {
    if (event.pointerType === "touch") {
      return;
    }

    if (!featured.previewUrl) {
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

    const video = videoRef.current;

    if (video) {
      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Ignore reset errors.
      }
    }

    setPreviewActive(false);
    setPreviewReady(false);
    setPreviewLoading(false);
    setSoundBlocked(false);
  }

  function handlePlaying() {
    setPreviewReady(true);
    setPreviewLoading(false);
    setSoundBlocked(false);
  }

  function handleWaiting() {
    setPreviewLoading(true);
  }

  function handleTimeUpdate(event) {
    if (
      event.currentTarget.currentTime >=
      MAX_PREVIEW_SECONDS
    ) {
      stopPreview();
    }
  }

  async function handleManualPreview(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      video.muted = false;
      video.volume = 1;

      await video.play();

      setPreviewReady(true);
      setPreviewLoading(false);
      setSoundBlocked(false);
    } catch (error) {
      console.error(
        "Could not play hero preview with sound:",
        error
      );
    }
  }

  return (
    <section
      onPointerEnter={handlePointerEnter}
      onPointerLeave={stopPreview}
      className="relative min-h-[275px] overflow-hidden rounded-[24px] bg-slate-950 shadow-[0_16px_45px_rgba(15,23,42,0.18)] lg:min-h-[290px]"
    >
      {/* THUMBNAIL */}

      {featured.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featured.thumbnailUrl}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            previewReady
              ? "opacity-0"
              : "opacity-100"
          }`}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 transition-opacity duration-500 ${
            previewReady
              ? "opacity-0"
              : "opacity-100"
          }`}
        />
      )}

      {/* HERO VIDEO PREVIEW */}

      {previewActive &&
        featured.previewUrl && (
          <video
            ref={videoRef}
            src={featured.previewUrl}
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback"
            onContextMenu={(event) =>
              event.preventDefault()
            }
            onPlaying={handlePlaying}
            onWaiting={handleWaiting}
            onTimeUpdate={
              handleTimeUpdate
            }
            onEnded={stopPreview}
            onError={(event) => {
              console.error(
                "Hero preview failed:",
                event
              );

              stopPreview();
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              previewReady
                ? "opacity-100"
                : "opacity-0"
            }`}
          />
        )}

      {/* CONTRAST */}

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/68 to-slate-950/10" />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/10" />

      {/* LOADING */}

      {previewActive &&
        previewLoading &&
        !soundBlocked && (
          <div className="absolute right-5 top-5 z-30 flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />

            Loading preview
          </div>
        )}

      {/* PREVIEW ACTIVE */}

      {previewActive &&
        previewReady &&
        !soundBlocked && (
          <div className="absolute right-5 top-5 z-30 flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            Preview
          </div>
        )}

      {/* AUDIO BLOCKED */}

      {previewActive &&
        soundBlocked && (
          <button
            type="button"
            onClick={
              handleManualPreview
            }
            className="absolute right-5 top-5 z-40 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow-xl transition hover:bg-emerald-50"
          >
            ▶ Preview with sound
          </button>
        )}

      {/* CONTENT */}

      <div className="relative z-20 flex min-h-[275px] max-w-lg flex-col justify-center px-6 py-6 text-white sm:px-7 lg:min-h-[290px]">
        <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-700/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur">
          ★ Featured session
        </span>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {featured.title}
        </h2>

        <p className="mt-1.5 text-xs font-semibold text-slate-200 sm:text-sm">
          {featured.instructor ||
            "MindSettle"}

          {featured.durationMinutes
            ? ` · ${featured.durationMinutes} min`
            : ""}
        </p>

        {featured.description && (
          <p className="mt-3 line-clamp-2 max-w-md text-xs leading-5 text-slate-100 sm:text-sm">
            {featured.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href={`/library/${featured.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300/40"
          >
            ▶ Start session
          </Link>

          <Link
            href={`/library/${featured.id}`}
            className="inline-flex items-center rounded-full border border-white/40 bg-slate-950/35 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20"
          >
            More info
          </Link>
        </div>
      </div>
    </section>
  );
}