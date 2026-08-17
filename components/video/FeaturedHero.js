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
  const videoRef =
    useRef(null);

  const hoverTimerRef =
    useRef(null);

  const [
    previewActive,
    setPreviewActive,
  ] = useState(false);

  const [
    previewReady,
    setPreviewReady,
  ] = useState(false);

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [
    soundBlocked,
    setSoundBlocked,
  ] = useState(false);

  const [
    failedPreviewUrl,
    setFailedPreviewUrl,
  ] = useState(null);

  const previewFailed =
    Boolean(
      featured?.previewUrl
    ) &&
    failedPreviewUrl ===
      featured?.previewUrl;

  useEffect(() => {
    if (
      !previewActive ||
      previewFailed
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready.
    }

    video.muted = false;
    video.volume = 1;

    async function startPreview() {
      try {
        await video.play();

        setPreviewReady(true);
        setPreviewLoading(false);
        setSoundBlocked(false);
      } catch (error) {
        console.info(
          "Hero autoplay with sound was blocked.",
          error
        );

        video.pause();

        setPreviewReady(false);
        setPreviewLoading(false);
        setSoundBlocked(true);
      }
    }

    startPreview();
  }, [
    previewActive,
    previewFailed,
  ]);

  useEffect(() => {
    return () => {
      if (
        hoverTimerRef.current
      ) {
        window.clearTimeout(
          hoverTimerRef.current
        );
      }
    };
  }, []);

  if (!featured) {
    return (
      <section
        className="
          flex
          h-full
          min-h-[300px]
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-[22px]
          border
          border-dashed
          border-[#cfd8cb]
          bg-[#f5f5ed]
          px-6
          text-center
          text-sm
          font-medium
          text-[#5a6d66]

          lg:min-h-[288px]
        "
      >
        No featured session available right now.
      </section>
    );
  }

  function handlePointerEnter(
    event
  ) {
    if (
      event.pointerType ===
      "touch"
    ) {
      return;
    }

    if (
      !featured.previewUrl ||
      previewFailed
    ) {
      return;
    }

    if (
      hoverTimerRef.current
    ) {
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
    if (
      hoverTimerRef.current
    ) {
      window.clearTimeout(
        hoverTimerRef.current
      );

      hoverTimerRef.current =
        null;
    }

    const video =
      videoRef.current;

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

  function handleTimeUpdate(
    event
  ) {
    if (
      event.currentTarget
        .currentTime >=
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

    const video =
      videoRef.current;

    if (
      !video ||
      previewFailed
    ) {
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
      console.info(
        "Hero preview could not start with sound.",
        error
      );
    }
  }

  function handlePreviewError(
    event
  ) {
    const mediaError =
      event.currentTarget.error;

    console.warn(
      "Hero preview unavailable. Falling back to thumbnail.",
      {
        code:
          mediaError?.code ||
          null,
        message:
          mediaError?.message ||
          null,
      }
    );

    if (
      hoverTimerRef.current
    ) {
      window.clearTimeout(
        hoverTimerRef.current
      );

      hoverTimerRef.current =
        null;
    }

    event.currentTarget.pause();

    setFailedPreviewUrl(
      featured.previewUrl
    );

    setPreviewActive(false);
    setPreviewReady(false);
    setPreviewLoading(false);
    setSoundBlocked(false);
  }

  return (
    <section
      onPointerEnter={
        handlePointerEnter
      }
      onPointerLeave={
        stopPreview
      }
      className="
        group/hero
        relative
        h-full
        min-h-[300px]
        w-full
        overflow-hidden
        rounded-[22px]
        bg-[#12372f]
        shadow-[0_18px_48px_rgba(18,55,47,0.24)]

        sm:min-h-[340px]
        lg:min-h-[288px]
      "
    >
      {featured.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            featured.thumbnailUrl
          }
          alt=""
          className={`
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-all
            duration-700

            group-hover/hero:scale-[1.015]

            ${
              previewReady
                ? "opacity-0"
                : "opacity-100"
            }
          `}
        />
      ) : (
        <div
          className={`
            absolute
            inset-0
            bg-gradient-to-br
            from-[#12372f]
            via-[#163d34]
            to-[#344d5a]
            transition-opacity
            duration-500

            ${
              previewReady
                ? "opacity-0"
                : "opacity-100"
            }
          `}
        />
      )}

      {previewActive &&
        !previewFailed &&
        featured.previewUrl && (
          <video
            ref={videoRef}
            src={
              featured.previewUrl
            }
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback"
            onContextMenu={(
              event
            ) =>
              event.preventDefault()
            }
            onPlaying={
              handlePlaying
            }
            onWaiting={
              handleWaiting
            }
            onTimeUpdate={
              handleTimeUpdate
            }
            onEnded={
              stopPreview
            }
            onError={
              handlePreviewError
            }
            className={`
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-opacity
              duration-500

              ${
                previewReady
                  ? "opacity-100"
                  : "opacity-0"
              }
            `}
          >
            Your browser does not
            support the video tag.
          </video>
        )}

      {/* FOREST-GREEN CINEMATIC OVERLAY */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-[linear-gradient(90deg,rgba(8,39,32,.95)_0%,rgba(8,39,32,.72)_48%,rgba(8,39,32,.16)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-[linear-gradient(0deg,rgba(8,39,32,.58)_0%,transparent_55%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
          rounded-[22px]
          ring-1
          ring-inset
          ring-white/10
        "
      />

      {previewActive &&
        previewLoading &&
        !soundBlocked &&
        !previewFailed && (
          <div
            className="
              absolute
              right-5
              top-5
              z-40
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-[#082720]/75
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-white
              backdrop-blur
            "
          >
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />

            Loading preview
          </div>
        )}

      {previewActive &&
        previewReady &&
        !soundBlocked &&
        !previewFailed && (
          <div
            className="
              absolute
              right-5
              top-5
              z-40
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-[#082720]/70
              px-3
              py-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-white
              backdrop-blur
            "
          >
            <span className="h-2 w-2 rounded-full bg-[#d7f2ad]" />

            Preview
          </div>
        )}

      {previewActive &&
        soundBlocked &&
        !previewFailed && (
          <button
            type="button"
            onClick={
              handleManualPreview
            }
            className="
              absolute
              right-5
              top-5
              z-50
              rounded-full
              bg-[#d7f2ad]
              px-4
              py-2
              text-[11px]
              font-semibold
              text-[#12372f]
              shadow-xl
              transition

              hover:bg-white
            "
          >
            ▶ Preview with sound
          </button>
        )}

      <div
        className="
          relative
          z-30
          flex
          h-full
          min-h-[300px]
          max-w-[620px]
          flex-col
          justify-center
          px-6
          py-7
          text-white

          sm:min-h-[340px]
          sm:px-8
          sm:py-8

          lg:min-h-[288px]
          lg:px-10
          lg:py-10

          xl:px-12
        "
      >
        <span
          className="
            w-fit
            rounded-full
            border
            border-white/20
            bg-white/10
            px-3
            py-1.5
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-[#d7f2ad]
            backdrop-blur-md

            sm:text-[10px]
          "
        >
          ★ Featured session
        </span>

        <h2
          className="
            mt-3
            max-w-xl
            text-3xl
            font-semibold
            leading-[1.04]
            tracking-[-0.035em]
            text-white

            sm:text-4xl
            lg:text-[34px]
          "
        >
          {featured.title}
        </h2>

        <p
          className="
            mt-2
            text-xs
            font-medium
            text-emerald-50/80

            sm:text-sm
          "
        >
          {featured.instructor ||
            "MindSettle"}

          {featured.durationMinutes
            ? ` · ${featured.durationMinutes} min`
            : ""}
        </p>

        {featured.description && (
          <p
            className="
              mt-3
              line-clamp-2
              max-w-lg
              text-xs
              leading-6
              text-emerald-50/90

              sm:text-sm
            "
          >
            {
              featured.description
            }
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href={`/library/${featured.id}`}
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              rounded-full
              bg-[#d7f2ad]
              px-5
              text-sm
              font-semibold
              text-[#12372f]
              shadow-[0_12px_28px_rgba(0,0,0,.20)]
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-white

              focus:outline-none
              focus:ring-4
              focus:ring-white/20
            "
          >
            ▶ Start session
          </Link>

          <Link
            href={`/library/${featured.id}`}
            className="
              inline-flex
              min-h-11
              items-center
              rounded-full
              border
              border-white/35
              bg-white/10
              px-5
              text-sm
              font-semibold
              text-white
              backdrop-blur-md
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-white/20

              focus:outline-none
              focus:ring-4
              focus:ring-white/20
            "
          >
            More info
          </Link>
        </div>
      </div>
    </section>
  );
}