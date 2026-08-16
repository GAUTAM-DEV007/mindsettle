"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const PREVIEW_DELAY_MS = 700;
const MAX_PREVIEW_SECONDS = 60;

/* =========================================================
   FEATURED HERO

   IMPORTANT:

   This component now fills the parent container.

   The Library page decides how large the hero area is.
   FeaturedHero no longer forces:
   - lg:w-3/4
   - large outer padding
   - tiny 218px desktop height
========================================================= */

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

  /* ======================================================
     PREVIEW
  ====================================================== */

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

  /* ======================================================
     CLEANUP
  ====================================================== */

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
          min-h-[300px]
          h-full
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-[22px]
          border
          border-dashed
          border-slate-300
          bg-slate-100
          text-sm
          font-medium
          text-slate-500

          lg:min-h-[288px]
        "
      >
        No featured session available.
      </section>
    );
  }

  /* ======================================================
     POINTER ENTER
  ====================================================== */

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

  /* ======================================================
     STOP PREVIEW
  ====================================================== */

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

  /* ======================================================
     MANUAL PREVIEW

     Used when browser blocks autoplay with sound.
  ====================================================== */

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

  /* ======================================================
     PREVIEW FAILURE
  ====================================================== */

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

  /* ======================================================
     HERO
  ====================================================== */

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
        bg-slate-950
        shadow-[0_18px_48px_rgba(15,23,42,0.20)]

        sm:min-h-[340px]
        lg:min-h-[288px]
      "
    >
      {/* =================================================
          THUMBNAIL

          object-cover ensures the image completely fills
          the large hero rectangle.
      ================================================= */}

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
            from-emerald-950
            via-slate-900
            to-sky-950
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

      {/* =================================================
          VIDEO PREVIEW
      ================================================= */}

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

      {/* =================================================
          CINEMATIC CONTRAST

          Stronger on the left where the text lives.
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-r
          from-slate-950/95
          via-slate-950/58
          to-transparent
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-t
          from-slate-950/65
          via-transparent
          to-slate-950/15
        "
      />

      {/* =================================================
          SUBTLE INNER EDGE

          Not the old white ring.
          Just a very soft cinematic edge.
      ================================================= */}

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

      {/* =================================================
          LOADING PREVIEW
      ================================================= */}

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
              bg-slate-950/75
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

      {/* =================================================
          ACTIVE PREVIEW
      ================================================= */}

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
              bg-slate-950/70
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
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            Preview
          </div>
        )}

      {/* =================================================
          SOUND BLOCKED
      ================================================= */}

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
              bg-white
              px-4
              py-2
              text-[11px]
              font-bold
              text-emerald-900
              shadow-xl
              transition

              hover:bg-emerald-50
            "
          >
            ▶ Preview with sound
          </button>
        )}

      {/* =================================================
          HERO CONTENT

          Content now scales appropriately for the
          larger rectangular hero.
      ================================================= */}

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
        {/* FEATURED LABEL */}

        <span
          className="
            w-fit
            rounded-full
            border
            border-emerald-300/30
            bg-emerald-700/75
            px-3
            py-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-emerald-50
            shadow-sm
            backdrop-blur

            sm:text-[10px]
          "
        >
          ★ Featured session
        </span>

        {/* TITLE */}

        <h2
          className="
            mt-2.5
            max-w-xl
            text-3xl
            font-bold
            leading-[1.05]
            tracking-tight
            text-white

            sm:text-4xl
            lg:text-[34px]
          "
        >
          {featured.title}
        </h2>

        {/* META */}

        <p
          className="
            mt-1.5
            text-xs
            font-semibold
            text-slate-200

            sm:text-sm
          "
        >
          {featured.instructor ||
            "MindSettle"}

          {featured.durationMinutes
            ? ` · ${featured.durationMinutes} min`
            : ""}
        </p>

        {/* DESCRIPTION */}

        {featured.description && (
          <p
            className="
              mt-2.5
              line-clamp-2
              max-w-lg
              text-xs
              leading-6
              text-slate-100

              sm:text-sm
            "
          >
            {
              featured.description
            }
          </p>
        )}

        {/* BUTTONS */}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href={`/library/${featured.id}`}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-emerald-600
              px-4
              py-2
              text-sm
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-emerald-500
              hover:shadow-xl

              focus:outline-none
              focus:ring-4
              focus:ring-emerald-300/40
            "
          >
            ▶ Start session
          </Link>

          <Link
            href={`/library/${featured.id}`}
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-white/40
              bg-slate-950/35
              px-4
              py-2
              text-sm
              font-bold
              text-white
              backdrop-blur
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-white/15

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