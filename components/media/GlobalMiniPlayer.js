"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useMediaSession,
} from "@/components/media/MediaSessionProvider";

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

async function safePlay(
  video
) {
  if (!video) {
    return false;
  }

  try {
    await video.play();

    return true;
  } catch (error) {
    /*
     * AbortError is normal when media ownership,
     * source or playback state changes quickly.
     */
    if (
      error?.name ===
        "AbortError" ||
      error?.name ===
        "NotAllowedError"
    ) {
      return false;
    }

    console.error(
      "Global mini-player playback failed:",
      error
    );

    return false;
  }
}

/* =========================================================
   PLAYER
========================================================= */

export default function GlobalMiniPlayer() {
  const videoRef =
    useRef(null);

  const wrapperRef =
    useRef(null);

  const dragRef =
    useRef(null);

  const initializedSessionRef =
    useRef(null);

  const [
    dragOffset,
    setDragOffset,
  ] = useState({
    x: 0,
    y: 0,
  });

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const {
    session,
    setPlaying,
    updateCurrentTime,
    updateVolume,
    hidePlayer,
    showMiniPlayer,
    closePlayer,
  } = useMediaSession();

  const media =
    session.media;

  const isMini =
    session.mode ===
    "mini";

  const isHidden =
    session.mode ===
    "hidden";

  const isActive =
    Boolean(
      media &&
      (
        isMini ||
        isHidden
      )
    );

  /* ======================================================
     NEW SESSION INITIALISATION

     Seek only once when a new session takes ownership.
     We do NOT seek again on every timeupdate.
  ====================================================== */

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !media ||
      !isActive
    ) {
      return;
    }

    if (
      initializedSessionRef.current ===
      session.sessionId
    ) {
      return;
    }

    initializedSessionRef.current =
      session.sessionId;

    const initialise =
      async () => {
        video.volume =
          clamp(
            session.volume ?? 1,
            0,
            1
          );

        video.muted =
          Boolean(
            session.muted
          );

        video.playbackRate =
          session.playbackRate ??
          1;

        if (
          Number.isFinite(
            session.currentTime
          ) &&
          session.currentTime > 0
        ) {
          try {
            video.currentTime =
              session.currentTime;
          } catch {
            // Metadata may not be ready yet.
          }
        }

        if (
          session.isPlaying
        ) {
          await safePlay(
            video
          );
        }
      };

    if (
      video.readyState >= 1
    ) {
      void initialise();

      return;
    }

    const handleMetadata =
      () => {
        void initialise();
      };

    video.addEventListener(
      "loadedmetadata",
      handleMetadata,
      {
        once: true,
      }
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleMetadata
      );
    };
  }, [
    isActive,
    media,
    session.currentTime,
    session.isPlaying,
    session.muted,
    session.playbackRate,
    session.sessionId,
    session.volume,
  ]);

  /* ======================================================
     GLOBAL PLAY / PAUSE SYNCHRONISATION

     Used later by preview arbitration as well.
  ====================================================== */

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !media ||
      !isActive
    ) {
      return;
    }

    if (
      session.isPlaying
    ) {
      if (
        video.paused
      ) {
        void safePlay(
          video
        );
      }

      return;
    }

    if (
      !video.paused
    ) {
      video.pause();
    }
  }, [
    isActive,
    media,
    session.isPlaying,
    session.sessionId,
  ]);

  /* ======================================================
     VOLUME / MUTE SYNCHRONISATION
  ====================================================== */

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !isActive
    ) {
      return;
    }

    video.volume =
      clamp(
        session.volume ?? 1,
        0,
        1
      );

    video.muted =
      Boolean(
        session.muted
      );
  }, [
    isActive,
    session.muted,
    session.volume,
  ]);

  /* ======================================================
     PLAYBACK RATE SYNCHRONISATION
  ====================================================== */

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !isActive
    ) {
      return;
    }

    video.playbackRate =
      session.playbackRate ??
      1;
  }, [
    isActive,
    session.playbackRate,
  ]);

  /* ======================================================
     DRAG
  ====================================================== */

  const handleDragStart =
    useCallback(
      (event) => {
        if (
          event.button !==
          undefined &&
          event.button !== 0
        ) {
          return;
        }

        const wrapper =
          wrapperRef.current;

        if (!wrapper) {
          return;
        }

        const rect =
          wrapper.getBoundingClientRect();

        dragRef.current = {
          pointerId:
            event.pointerId,

          startX:
            event.clientX,

          startY:
            event.clientY,

          startOffsetX:
            dragOffset.x,

          startOffsetY:
            dragOffset.y,

          rect,
        };

        setIsDragging(
          true
        );

        try {
          wrapper.setPointerCapture(
            event.pointerId
          );
        } catch {
          // Optional.
        }
      },
      [
        dragOffset.x,
        dragOffset.y,
      ]
    );

  const handleDragMove =
    useCallback(
      (event) => {
        const drag =
          dragRef.current;

        if (
          !drag ||
          drag.pointerId !==
            event.pointerId
        ) {
          return;
        }

        const dx =
          event.clientX -
          drag.startX;

        const dy =
          event.clientY -
          drag.startY;

        const proposedX =
          drag.startOffsetX +
          dx;

        const proposedY =
          drag.startOffsetY +
          dy;

        const margin =
          12;

        const minX =
          margin -
          drag.rect.left;

        const maxX =
          window.innerWidth -
          margin -
          drag.rect.right;

        const minY =
          margin -
          drag.rect.top;

        const maxY =
          window.innerHeight -
          margin -
          drag.rect.bottom;

        setDragOffset({
          x:
            clamp(
              proposedX,
              minX,
              maxX
            ),

          y:
            clamp(
              proposedY,
              minY,
              maxY
            ),
        });
      },
      []
    );

  const handleDragEnd =
    useCallback(
      (event) => {
        const drag =
          dragRef.current;

        if (
          !drag ||
          drag.pointerId !==
            event.pointerId
        ) {
          return;
        }

        dragRef.current =
          null;

        setIsDragging(
          false
        );

        try {
          wrapperRef.current
            ?.releasePointerCapture(
              event.pointerId
            );
        } catch {
          // Already released.
        }
      },
      []
    );

  /* ======================================================
     CONTROLS
  ====================================================== */

  function togglePlayback() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (
      video.paused
    ) {
      void safePlay(
        video
      );

      return;
    }

    video.pause();
  }

  function handleClose() {
    const video =
      videoRef.current;

    if (video) {
      video.pause();

      video.removeAttribute(
        "src"
      );

      video.load();
    }

    initializedSessionRef.current =
      null;

    closePlayer();
  }

  /* ======================================================
     NOTHING ACTIVE
  ====================================================== */

  if (
    !media ||
    (
      session.mode !==
        "mini" &&
      session.mode !==
        "hidden"
    )
  ) {
    return null;
  }

  return (
    <>
      {/* ==================================================
          PERSISTENT MEDIA ELEMENT

          Important:
          even in "hidden" mode the video remains mounted,
          so currentTime/session are retained.
      ================================================== */}

      <div
        ref={wrapperRef}
        className={
          isHidden
            ? `
              pointer-events-none
              fixed
              bottom-0
              right-0
              z-[9998]
              h-px
              w-px
              overflow-hidden
              opacity-0
            `
            : `
              fixed
              bottom-5
              right-5
              z-[10000]
              w-[min(380px,calc(100vw-24px))]
              overflow-hidden
              rounded-2xl
              border
              border-white/15
              bg-black
              shadow-[0_24px_80px_rgba(0,0,0,0.45)]
              touch-none
            `
        }
        style={
          isHidden
            ? undefined
            : {
                aspectRatio:
                  media.aspectRatio ||
                  16 / 9,

                transform:
                  `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,

                transition:
                  isDragging
                    ? "none"
                    : "transform 140ms ease",
              }
        }
      >
        <video
          ref={videoRef}
          src={media.src}
          poster={
            media.poster ||
            undefined
          }
          playsInline
          preload="auto"
          className={
            isHidden
              ? "h-px w-px"
              : "h-full w-full bg-black object-contain"
          }
          onPlay={() => {
            setPlaying(
              true
            );
          }}
          onPause={() => {
            /*
             * Do not falsely mark the session paused
             * if this event belongs to a stale element.
             */
            setPlaying(
              false
            );
          }}
          onTimeUpdate={(event) => {
            updateCurrentTime(
              event.currentTarget
                .currentTime,
              session.sessionId
            );
          }}
          onVolumeChange={(event) => {
            updateVolume(
              event.currentTarget
                .volume,
              event.currentTarget
                .muted
            );
          }}
          onEnded={() => {
            setPlaying(
              false
            );
          }}
        />

        {isMini && (
          <>
            {/* Drag handle / title */}
            <div
              onPointerDown={
                handleDragStart
              }
              onPointerMove={
                handleDragMove
              }
              onPointerUp={
                handleDragEnd
              }
              onPointerCancel={
                handleDragEnd
              }
              className="
                absolute
                inset-x-0
                top-0
                z-20
                flex
                cursor-grab
                items-center
                justify-between
                gap-2
                bg-gradient-to-b
                from-black/80
                via-black/45
                to-transparent
                p-2
                pb-6
                active:cursor-grabbing
              "
            >
              <div className="min-w-0 px-1">
                <p className="truncate text-xs font-semibold text-white">
                  {media.title ||
                    "Now Playing"}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();

                    hidePlayer();
                  }}
                  aria-label="Hide player"
                  title="Hide player"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-black/55
                    text-sm
                    font-semibold
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/75
                  "
                >
                  —
                </button>

                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();

                    handleClose();
                  }}
                  aria-label="Close player"
                  title="Close player"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-black/55
                    text-lg
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/75
                  "
                >
                  ×
                </button>
              </div>
            </div>

            {/* Centre play/pause target */}
            <button
              type="button"
              onClick={
                togglePlayback
              }
              aria-label={
                session.isPlaying
                  ? "Pause"
                  : "Play"
              }
              className="
                absolute
                inset-0
                z-10
                m-auto
                h-20
                w-20
                rounded-full
                bg-transparent
              "
            />

            {/* Small status */}
            <div
              className="
                pointer-events-none
                absolute
                bottom-2
                left-2
                z-20
                rounded-full
                bg-black/55
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-white
                backdrop-blur
              "
            >
              {session.isPlaying
                ? "Playing"
                : "Paused"}
            </div>
          </>
        )}
      </div>

      {/* ==================================================
          HIDDEN PLAYER RESTORE PILL
      ================================================== */}

      {isHidden && (
        <button
          type="button"
          onClick={
            showMiniPlayer
          }
          className="
            fixed
            bottom-5
            right-5
            z-[10000]
            flex
            max-w-[calc(100vw-24px)]
            items-center
            gap-3
            rounded-full
            border
            border-[#cfd8cb]
            bg-[#f5f5ed]/95
            px-4
            py-2.5
            text-left
            shadow-[0_16px_45px_rgba(18,55,47,0.18)]
            backdrop-blur
            transition
            hover:-translate-y-0.5
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#163d34]
              text-xs
              text-white
            "
          >
            ▶
          </span>

          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5a6d66]">
              Now Playing
            </span>

            <span className="block max-w-[220px] truncate text-sm font-semibold text-[#163d34]">
              {media.title ||
                "MindSettle"}
            </span>
          </span>
        </button>
      )}
    </>
  );
}
