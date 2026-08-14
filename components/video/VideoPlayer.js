"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const CONTROLS_HIDE_DELAY =
  1000;

const NEXT_VIDEO_DELAY =
  5;

const DOUBLE_TAP_DELAY =
  320;

const TAP_MOVEMENT_LIMIT =
  18;

const SWIPE_DOWN_THRESHOLD =
  80;

const TRACKPAD_SWIPE_THRESHOLD =
  120;

/* =========================================================
   ORIENTATION
========================================================= */

function getOrientation(
  width,
  height
) {
  if (
    !width ||
    !height
  ) {
    return {
      ratio:
        16 / 9,

      orientation:
        "landscape",
    };
  }

  const ratio =
    width /
    height;

  if (
    ratio >=
      0.92 &&
    ratio <=
      1.08
  ) {
    return {
      ratio,
      orientation:
        "square",
    };
  }

  if (
    ratio <
    1
  ) {
    return {
      ratio,
      orientation:
        "portrait",
    };
  }

  return {
    ratio,
    orientation:
      "landscape",
  };
}

/* =========================================================
   PLAYER
========================================================= */

export default function VideoPlayer({
  initialMedia,
  playlist = [],
}) {
  const videoRef =
    useRef(null);

  const wrapperRef =
    useRef(null);

  const controlsTimerRef =
    useRef(null);

  const nextTimerRef =
    useRef(null);

  const nextIntervalRef =
    useRef(null);

  const shouldAutoplayRef =
    useRef(false);

  const pointerStartRef =
    useRef(null);

  const lastTapRef =
    useRef({
      time: 0,
      x: 0,
      y: 0,
    });

  const wheelAmountRef =
    useRef(0);

  const wheelResetRef =
    useRef(null);

  const volumeRef =
    useRef(1);

  const mutedRef =
    useRef(false);

  const [
    currentMedia,
    setCurrentMedia,
  ] =
    useState(
      initialMedia
    );

  /*
   * -1 means we are still
   * playing initialMedia.
   *
   * 0 means playlist[0]
   * is playing.
   */
  const [
    playlistIndex,
    setPlaylistIndex,
  ] =
    useState(-1);

  const [
    started,
    setStarted,
  ] =
    useState(false);

  const [
    isFullscreen,
    setIsFullscreen,
  ] =
    useState(false);

  const [
    isMiniPlayer,
    setIsMiniPlayer,
  ] =
    useState(false);

  const [
    isPlaying,
    setIsPlaying,
  ] =
    useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(0);

  const [
    duration,
    setDuration,
  ] =
    useState(0);

  const [
    volume,
    setVolume,
  ] =
    useState(1);

  const [
    isMuted,
    setIsMuted,
  ] =
    useState(false);

  const [
    playbackRate,
    setPlaybackRate,
  ] =
    useState(1);

  const [
    mediaAspectRatio,
    setMediaAspectRatio,
  ] =
    useState(
      16 / 9
    );

  const [
    mediaOrientation,
    setMediaOrientation,
  ] =
    useState(
      "landscape"
    );

  const [
    controlsVisible,
    setControlsVisible,
  ] =
    useState(true);

  const [
    nextPreviewVisible,
    setNextPreviewVisible,
  ] =
    useState(false);

  const [
    nextCountdown,
    setNextCountdown,
  ] =
    useState(
      NEXT_VIDEO_DELAY
    );

  /* ======================================================
     NEXT MEDIA
  ====================================================== */

  const nextPlaylistIndex =
    playlistIndex +
    1;

  const nextMedia =
    playlist[
      nextPlaylistIndex
    ] ??
    null;

  /* ======================================================
     CLEANUP
  ====================================================== */

  useEffect(() => {
    return () => {
      if (
        controlsTimerRef.current
      ) {
        window.clearTimeout(
          controlsTimerRef.current
        );
      }

      if (
        nextTimerRef.current
      ) {
        window.clearTimeout(
          nextTimerRef.current
        );
      }

      if (
        nextIntervalRef.current
      ) {
        window.clearInterval(
          nextIntervalRef.current
        );
      }

      if (
        wheelResetRef.current
      ) {
        window.clearTimeout(
          wheelResetRef.current
        );
      }
    };
  }, []);

  /* ======================================================
     PLAY NEW MEDIA AFTER SOURCE CHANGES

     This keeps the SAME outer player,
     so fullscreen or floating state
     is preserved.
  ====================================================== */

  useEffect(() => {
    if (
      !shouldAutoplayRef.current
    ) {
      return;
    }

    shouldAutoplayRef.current =
      false;

    const timer =
      window.setTimeout(
        async () => {
          const video =
            videoRef.current;

          if (!video) {
            return;
          }

          video.volume =
            volumeRef.current;

          video.muted =
            mutedRef.current;

          try {
            await video.play();
          } catch (
            error
          ) {
            console.info(
              "Autoplay with sound was blocked. Trying muted playback.",
              error
            );

            try {
              video.muted =
                true;

              mutedRef.current =
                true;

              await video.play();
            } catch (
              mutedError
            ) {
              console.info(
                "Automatic next playback could not start:",
                mutedError
              );
            }
          }
        },
        120
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    currentMedia.id,
  ]);

  /* ======================================================
     POSTER DIMENSIONS

     Used for audio + cover.
  ====================================================== */

  useEffect(() => {
    if (
      !currentMedia.poster ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const image =
      new window.Image();

    image.onload =
      () => {
        const video =
          videoRef.current;

        if (
          video
            ?.videoWidth &&
          video
            ?.videoHeight
        ) {
          return;
        }

        const result =
          getOrientation(
            image.naturalWidth,
            image.naturalHeight
          );

        setMediaAspectRatio(
          result.ratio
        );

        setMediaOrientation(
          result.orientation
        );
      };

    image.src =
      currentMedia.poster;
  }, [
    currentMedia.poster,
  ]);

  /* ======================================================
     CONTROLS
  ====================================================== */

  function clearControlsTimer() {
    if (
      controlsTimerRef.current
    ) {
      window.clearTimeout(
        controlsTimerRef.current
      );

      controlsTimerRef.current =
        null;
    }
  }

  function scheduleControlsHide() {
    clearControlsTimer();

    controlsTimerRef.current =
      window.setTimeout(
        () => {
          setControlsVisible(
            false
          );

          controlsTimerRef.current =
            null;
        },
        CONTROLS_HIDE_DELAY
      );
  }

  function showControls() {
    if (
      nextPreviewVisible
    ) {
      return;
    }

    setControlsVisible(
      true
    );

    scheduleControlsHide();
  }

  function handlePointerActivity() {
    if (
      !started
    ) {
      return;
    }

    showControls();
  }

  function handlePointerLeave() {
    if (
      !started
    ) {
      return;
    }

    clearControlsTimer();

    setControlsVisible(
      false
    );
  }

  /* ======================================================
     FULLSCREEN STATE
  ====================================================== */

  useEffect(() => {
    function syncFullscreen() {
      const element =
        document.fullscreenElement ||
        document.webkitFullscreenElement;

      setIsFullscreen(
        Boolean(
          element
        )
      );
    }

    document.addEventListener(
      "fullscreenchange",
      syncFullscreen
    );

    document.addEventListener(
      "webkitfullscreenchange",
      syncFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        syncFullscreen
      );

      document.removeEventListener(
        "webkitfullscreenchange",
        syncFullscreen
      );
    };
  }, []);

  /* ======================================================
     ENTER FULLSCREEN
  ====================================================== */

  async function enterFullscreen() {
    const wrapper =
      wrapperRef.current;

    const video =
      videoRef.current;

    if (!wrapper) {
      return;
    }

    setIsMiniPlayer(
      false
    );

    try {
      if (
        wrapper.requestFullscreen
      ) {
        await wrapper.requestFullscreen();
      } else if (
        wrapper.webkitRequestFullscreen
      ) {
        wrapper.webkitRequestFullscreen();
      } else if (
        video?.webkitEnterFullscreen
      ) {
        video.webkitEnterFullscreen();
      }
    } catch (
      error
    ) {
      console.error(
        "Could not enter fullscreen:",
        error
      );
    }
  }

  /* ======================================================
     EXIT FULLSCREEN
  ====================================================== */

  async function exitFullscreen() {
    const video =
      videoRef.current;

    try {
      if (
        document.fullscreenElement &&
        document.exitFullscreen
      ) {
        await document.exitFullscreen();

        return;
      }

      if (
        document.webkitFullscreenElement &&
        document.webkitExitFullscreen
      ) {
        document.webkitExitFullscreen();

        return;
      }

      if (
        video
          ?.webkitDisplayingFullscreen &&
        video.webkitExitFullscreen
      ) {
        video.webkitExitFullscreen();
      }
    } catch (
      error
    ) {
      console.error(
        "Could not exit fullscreen:",
        error
      );
    }
  }

  /* ======================================================
     FULLSCREEN TOGGLE
  ====================================================== */

  async function toggleFullscreen() {
    showControls();

    if (
      isFullscreen
    ) {
      await exitFullscreen();

      return;
    }

    await enterFullscreen();
  }

  /* ======================================================
     FIRST PLAY

     KEEP THIS:
     PLAY -> FULLSCREEN -> PLAY
  ====================================================== */

  async function handleStart() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    setStarted(
      true
    );

    setControlsVisible(
      true
    );

    await enterFullscreen();

    try {
      await video.play();
    } catch (
      error
    ) {
      console.error(
        "Could not play video:",
        error
      );
    }

    scheduleControlsHide();
  }

  /* ======================================================
     PLAY / PAUSE
  ====================================================== */

  async function togglePlay() {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (
      video.paused
    ) {
      try {
        await video.play();

        setStarted(
          true
        );
      } catch (
        error
      ) {
        console.error(
          "Could not play video:",
          error
        );
      }

      return;
    }

    video.pause();
  }

  /* ======================================================
     FLOATING MINI PLAYER
  ====================================================== */

  async function enterMiniPlayer() {
    if (
      !started
    ) {
      return;
    }

    /*
     * Playback is NOT paused.
     */

    if (
      isFullscreen
    ) {
      await exitFullscreen();
    }

    setIsMiniPlayer(
      true
    );

    setControlsVisible(
      true
    );

    scheduleControlsHide();
  }

  function returnToInlinePlayer() {
    setIsMiniPlayer(
      false
    );

    showControls();
  }

  /* ======================================================
     DOUBLE TAP + SWIPE
  ====================================================== */

  function handleGestureStart(
    event
  ) {
    if (
      event.target.closest(
        "button, input"
      )
    ) {
      pointerStartRef.current =
        null;

      return;
    }

    pointerStartRef.current =
      {
        x:
          event.clientX,

        y:
          event.clientY,
      };

    handlePointerActivity();
  }

  async function handleGestureEnd(
    event
  ) {
    if (
      event.target.closest(
        "button, input"
      )
    ) {
      pointerStartRef.current =
        null;

      return;
    }

    const start =
      pointerStartRef.current;

    pointerStartRef.current =
      null;

    if (!start) {
      return;
    }

    const deltaX =
      event.clientX -
      start.x;

    const deltaY =
      event.clientY -
      start.y;

    const distance =
      Math.hypot(
        deltaX,
        deltaY
      );

    /* ---------------------------------
       SWIPE DOWN -> FLOATING
    --------------------------------- */

    if (
      started &&
      deltaY >
        SWIPE_DOWN_THRESHOLD &&
      Math.abs(
        deltaY
      ) >
        Math.abs(
          deltaX
        ) *
          1.25
    ) {
      await enterMiniPlayer();

      return;
    }

    if (
      distance >
      TAP_MOVEMENT_LIMIT
    ) {
      return;
    }

    const now =
      performance.now();

    const last =
      lastTapRef.current;

    const closeToPreviousTap =
      Math.hypot(
        event.clientX -
          last.x,

        event.clientY -
          last.y
      ) <
      60;

    /* ---------------------------------
       DOUBLE TAP -> FULLSCREEN/MINIMISE
    --------------------------------- */

    if (
      now -
        last.time <=
        DOUBLE_TAP_DELAY &&
      closeToPreviousTap
    ) {
      lastTapRef.current =
        {
          time: 0,
          x: 0,
          y: 0,
        };

      await toggleFullscreen();

      return;
    }

    lastTapRef.current =
      {
        time:
          now,

        x:
          event.clientX,

        y:
          event.clientY,
      };
  }

  /* ======================================================
     TRACKPAD SWIPE DOWN
  ====================================================== */

  function handleWheelGesture(
    event
  ) {
    if (
      !isFullscreen ||
      !started ||
      event.deltaY <=
        0
    ) {
      return;
    }

    if (
      Math.abs(
        event.deltaY
      ) <=
      Math.abs(
        event.deltaX
      )
    ) {
      return;
    }

    wheelAmountRef.current +=
      Math.abs(
        event.deltaY
      );

    if (
      wheelResetRef.current
    ) {
      window.clearTimeout(
        wheelResetRef.current
      );
    }

    wheelResetRef.current =
      window.setTimeout(
        () => {
          wheelAmountRef.current =
            0;
        },
        250
      );

    if (
      wheelAmountRef.current >=
      TRACKPAD_SWIPE_THRESHOLD
    ) {
      wheelAmountRef.current =
        0;

      void enterMiniPlayer();
    }
  }

  /* ======================================================
     NEXT TIMER CLEANUP
  ====================================================== */

  function clearNextTimers() {
    if (
      nextTimerRef.current
    ) {
      window.clearTimeout(
        nextTimerRef.current
      );

      nextTimerRef.current =
        null;
    }

    if (
      nextIntervalRef.current
    ) {
      window.clearInterval(
        nextIntervalRef.current
      );

      nextIntervalRef.current =
        null;
    }
  }

  /* ======================================================
     LOAD NEXT VIDEO INSIDE SAME PLAYER
  ====================================================== */

  function playNextMedia() {
    if (
      !nextMedia
    ) {
      return;
    }

    clearNextTimers();
    clearControlsTimer();

    shouldAutoplayRef.current =
      true;

    setNextPreviewVisible(
      false
    );

    setNextCountdown(
      NEXT_VIDEO_DELAY
    );

    setControlsVisible(
      false
    );

    setCurrentTime(
      0
    );

    setDuration(
      0
    );

    setStarted(
      true
    );

    setPlaylistIndex(
      nextPlaylistIndex
    );

    setCurrentMedia(
      nextMedia
    );
  }

  /* ======================================================
     5 SECOND NEXT PREVIEW
  ====================================================== */

  function beginNextCountdown() {
    if (
      !nextMedia
    ) {
      clearControlsTimer();

      setControlsVisible(
        true
      );

      return;
    }

    clearControlsTimer();
    clearNextTimers();

    setNextCountdown(
      NEXT_VIDEO_DELAY
    );

    setNextPreviewVisible(
      true
    );

    setControlsVisible(
      false
    );

    let remaining =
      NEXT_VIDEO_DELAY;

    nextIntervalRef.current =
      window.setInterval(
        () => {
          remaining -=
            1;

          setNextCountdown(
            Math.max(
              remaining,
              0
            )
          );

          if (
            remaining <=
            0 &&
            nextIntervalRef.current
          ) {
            window.clearInterval(
              nextIntervalRef.current
            );

            nextIntervalRef.current =
              null;
          }
        },
        1000
      );

    nextTimerRef.current =
      window.setTimeout(
        () => {
          playNextMedia();
        },
        NEXT_VIDEO_DELAY *
          1000
      );
  }

  function cancelNextVideo() {
    clearNextTimers();

    setNextPreviewVisible(
      false
    );

    setControlsVisible(
      true
    );
  }

  /* ======================================================
     SEEK
  ====================================================== */

  function handleSeek(
    event
  ) {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const nextTime =
      Number(
        event.target.value
      );

    video.currentTime =
      nextTime;

    setCurrentTime(
      nextTime
    );
  }

  function skip(
    seconds
  ) {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const nextTime =
      Math.min(
        Math.max(
          video.currentTime +
            seconds,
          0
        ),
        Number.isFinite(
          video.duration
        )
          ? video.duration
          : video.currentTime +
              seconds
      );

    video.currentTime =
      nextTime;

    setCurrentTime(
      nextTime
    );
  }

  /* ======================================================
     VOLUME
  ====================================================== */

  function handleVolumeChange(
    event
  ) {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const nextVolume =
      Number(
        event.target.value
      );

    video.volume =
      nextVolume;

    video.muted =
      nextVolume ===
      0;

    volumeRef.current =
      nextVolume;

    mutedRef.current =
      nextVolume ===
      0;

    setVolume(
      nextVolume
    );

    setIsMuted(
      nextVolume ===
      0
    );
  }

  function toggleMute() {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.muted =
      !video.muted;

    mutedRef.current =
      video.muted;

    setIsMuted(
      video.muted
    );
  }

  /* ======================================================
     SPEED
  ====================================================== */

  function cyclePlaybackRate() {
    showControls();

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const speeds =
      [
        1,
        1.25,
        1.5,
        2,
        0.75,
      ];

    const currentIndex =
      speeds.indexOf(
        playbackRate
      );

    const nextRate =
      speeds[
        (currentIndex +
          1) %
          speeds.length
      ];

    video.playbackRate =
      nextRate;

    setPlaybackRate(
      nextRate
    );
  }

  /* ======================================================
     METADATA
  ====================================================== */

  function handleLoadedMetadata(
    event
  ) {
    const video =
      event.currentTarget;

    video.volume =
      volumeRef.current;

    video.muted =
      mutedRef.current;

    video.playbackRate =
      playbackRate;

    setDuration(
      video.duration ||
        0
    );

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    const result =
      getOrientation(
        video.videoWidth,
        video.videoHeight
      );

    setMediaAspectRatio(
      result.ratio
    );

    setMediaOrientation(
      result.orientation
    );
  }

  /* ======================================================
     TIME FORMAT
  ====================================================== */

  function formatTime(
    seconds
  ) {
    if (
      !Number.isFinite(
        seconds
      )
    ) {
      return "0:00";
    }

    const hours =
      Math.floor(
        seconds /
          3600
      );

    const minutes =
      Math.floor(
        (
          seconds %
          3600
        ) /
          60
      );

    const remainingSeconds =
      Math.floor(
        seconds %
          60
      );

    if (
      hours >
      0
    ) {
      return `${hours}:${minutes
        .toString()
        .padStart(
          2,
          "0"
        )}:${remainingSeconds
        .toString()
        .padStart(
          2,
          "0"
        )}`;
    }

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(
        2,
        "0"
      )}`;
  }

  function handleContextMenu(
    event
  ) {
    event.preventDefault();
  }

  /* ======================================================
     PLAYER SIZE
  ====================================================== */

  const normalPlayerWidth =
    mediaOrientation ===
    "portrait"
      ? "min(100%, 560px)"
      : mediaOrientation ===
          "square"
        ? "min(100%, 760px)"
        : "100%";

  const visibleClass =
    controlsVisible
      ? "opacity-100"
      : "pointer-events-none opacity-0";

  let wrapperClass =
    "group relative overflow-hidden bg-black shadow-2xl transition-all duration-300";

  if (
    isFullscreen
  ) {
    wrapperClass +=
      " h-screen w-screen max-w-none rounded-none touch-none";
  } else if (
    isMiniPlayer
  ) {
    wrapperClass +=
      " fixed bottom-5 right-5 z-[9999] w-[min(380px,calc(100vw-24px))] rounded-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]";
  } else {
    wrapperClass +=
      " mx-auto w-full rounded-[28px] border border-white/10";
  }

  /* ======================================================
     PLAYER
  ====================================================== */

  return (
    <div
      ref={
        wrapperRef
      }
      onContextMenu={
        handleContextMenu
      }
      onPointerMove={
        handlePointerActivity
      }
      onPointerEnter={
        handlePointerActivity
      }
      onPointerLeave={
        handlePointerLeave
      }
      onPointerDown={
        handleGestureStart
      }
      onPointerUp={
        handleGestureEnd
      }
      onWheel={
        handleWheelGesture
      }
      data-orientation={
        mediaOrientation
      }
      className={`${wrapperClass} ${
        started &&
        !controlsVisible &&
        !nextPreviewVisible
          ? "cursor-none"
          : ""
      }`}
      style={
        isFullscreen
          ? undefined
          : {
              aspectRatio:
                mediaAspectRatio,

              maxWidth:
                isMiniPlayer
                  ? undefined
                  : normalPlayerWidth,
            }
      }
    >
      {/* ==================================================
          FULLSCREEN BACKGROUND
      ================================================== */}

      {isFullscreen &&
        currentMedia.poster && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                currentMedia.poster
              }
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-3xl"
            />

            <div className="pointer-events-none absolute inset-0 bg-black/45" />
          </>
        )}

      {/* ==================================================
          ACTUAL VIDEO

          Key changes ONLY this video element.
          The outer fullscreen wrapper remains alive.
      ================================================== */}

      <video
        key={
          currentMedia.id
        }
        ref={
          videoRef
        }
        src={
          currentMedia.src
        }
        poster={
          currentMedia.poster ||
          undefined
        }
        title={
          currentMedia.title
        }
        controls={
          false
        }
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        preload="auto"
        className="relative z-10 h-full w-full bg-transparent object-contain"
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onDurationChange={(
          event
        ) => {
          setDuration(
            event
              .currentTarget
              .duration ||
              0
          );
        }}
        onTimeUpdate={(
          event
        ) => {
          setCurrentTime(
            event
              .currentTarget
              .currentTime
          );
        }}
        onPlay={() => {
          setStarted(
            true
          );

          setIsPlaying(
            true
          );

          setNextPreviewVisible(
            false
          );

          scheduleControlsHide();
        }}
        onPause={() => {
          setIsPlaying(
            false
          );

          if (
            !nextPreviewVisible
          ) {
            showControls();
          }
        }}
        onEnded={() => {
          setIsPlaying(
            false
          );

          beginNextCountdown();
        }}
        onVolumeChange={(
          event
        ) => {
          volumeRef.current =
            event
              .currentTarget
              .volume;

          mutedRef.current =
            event
              .currentTarget
              .muted;

          setVolume(
            event
              .currentTarget
              .volume
          );

          setIsMuted(
            event
              .currentTarget
              .muted
          );
        }}
      >
        Your browser does
        not support the
        video tag.
      </video>

      {/* ==================================================
          DARK GRADIENT
      ================================================== */}

      {started &&
        !nextPreviewVisible && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/25 via-transparent to-black/75 transition-opacity duration-300 ${visibleClass}`}
          />
        )}

      {/* ==================================================
          TITLE
      ================================================== */}

      {started &&
        currentMedia.title &&
        !nextPreviewVisible && (
          <div
            className={`pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-16 transition-opacity duration-300 ${visibleClass}`}
          >
            <p className="max-w-[75%] truncate text-center font-mono text-xs font-medium uppercase tracking-[0.08em] text-white/95 sm:text-base lg:text-lg">
              {
                currentMedia.title
              }
            </p>
          </div>
        )}

      {/* ==================================================
          INITIAL PLAY

          PLAY STILL STARTS FULLSCREEN.
      ================================================== */}

      {!started && (
        <button
          type="button"
          onClick={
            handleStart
          }
          aria-label={`Play ${currentMedia.title}`}
          className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center bg-black/5 transition hover:bg-black/10"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 pl-1 text-xl text-white shadow-xl backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-black/65">
            ▶
          </span>
        </button>
      )}

      {/* ==================================================
          MINI PLAYER RETURN
      ================================================== */}

      {started &&
        isMiniPlayer &&
        !nextPreviewVisible && (
          <button
            type="button"
            onClick={
              returnToInlinePlayer
            }
            aria-label="Return player to page"
            title="Return player to page"
            className={`absolute left-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-sm text-white backdrop-blur transition-all duration-300 hover:bg-black/80 ${visibleClass}`}
          >
            ↙
          </button>
        )}

      {/* ==================================================
          FULLSCREEN BUTTON

          PRESENT IN NORMAL AND FLOATING MODE.
      ================================================== */}

      {started &&
        !nextPreviewVisible && (
          <button
            type="button"
            onClick={
              toggleFullscreen
            }
            aria-label={
              isFullscreen
                ? "Minimise video"
                : "Play fullscreen"
            }
            title={
              isFullscreen
                ? "Minimise"
                : "Fullscreen"
            }
            className={`absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-black/50 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/75 ${visibleClass}`}
          >
            {isFullscreen ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 4v5H4" />
                <path d="M15 4v5h5" />
                <path d="M9 20v-5H4" />
                <path d="M15 20v-5h5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 3H3v5" />
                <path d="M16 3h5v5" />
                <path d="M8 21H3v-5" />
                <path d="M16 21h5v-5" />
              </svg>
            )}
          </button>
        )}

      {/* ==================================================
          CONTROLS
      ================================================== */}

      {started &&
        !nextPreviewVisible && (
          <div
            className={`absolute inset-x-[5%] bottom-[5%] z-40 transition-opacity duration-300 ${visibleClass}`}
          >
            {/* PROGRESS */}

            <input
              type="range"
              min="0"
              max={
                duration ||
                0
              }
              step="0.1"
              value={Math.min(
                currentTime,
                duration ||
                  0
              )}
              onChange={
                handleSeek
              }
              aria-label="Video progress"
              className="mb-3 h-1 w-full cursor-pointer accent-white"
            />

            <div className="flex items-center gap-2 text-white sm:gap-3">
              {/* PLAY */}

              <button
                type="button"
                onClick={
                  togglePlay
                }
                aria-label={
                  isPlaying
                    ? "Pause video"
                    : "Play video"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-white/10"
              >
                {isPlaying
                  ? "❚❚"
                  : "▶"}
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  skip(-10)
                }
                className="hidden text-xs sm:block"
                aria-label="Back 10 seconds"
              >
                ↶10
              </button>

              {/* FORWARD */}

              <button
                type="button"
                onClick={() =>
                  skip(10)
                }
                className="hidden text-xs sm:block"
                aria-label="Forward 10 seconds"
              >
                10↷
              </button>

              {/* VOLUME */}

              <button
                type="button"
                onClick={
                  toggleMute
                }
                className="flex h-8 w-8 items-center justify-center"
                aria-label={
                  isMuted
                    ? "Unmute"
                    : "Mute"
                }
              >
                {isMuted ||
                volume ===
                  0
                  ? "🔇"
                  : "🔊"}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={
                  isMuted
                    ? 0
                    : volume
                }
                onChange={
                  handleVolumeChange
                }
                aria-label="Volume"
                className="hidden w-16 accent-white md:block"
              />

              {/* TIME */}

              <span className="whitespace-nowrap font-mono text-[10px] sm:text-xs">
                {formatTime(
                  currentTime
                )}{" "}
                /{" "}
                {formatTime(
                  duration
                )}
              </span>

              <div className="flex-1" />

              {/* NEXT */}

              {nextMedia && (
                <button
                  type="button"
                  onClick={
                    playNextMedia
                  }
                  title={`Next: ${nextMedia.title}`}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-white/10"
                >
                  <span className="hidden sm:inline">
                    Next
                  </span>

                  <span>
                    ⏭
                  </span>
                </button>
              )}

              {/* SPEED */}

              <button
                type="button"
                onClick={
                  cyclePlaybackRate
                }
                className="hidden font-mono text-xs sm:block"
              >
                {
                  playbackRate
                }
                x
              </button>
            </div>
          </div>
        )}

      {/* ==================================================
          5 SECOND NEXT PREVIEW

          THIS REMAINS INSIDE THE SAME
          FULLSCREEN / FLOATING PLAYER.
      ================================================== */}

      {nextPreviewVisible &&
        nextMedia && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black">
            {nextMedia.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  nextMedia.poster
                }
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
            )}

            <div className="absolute inset-0 bg-black/55" />

            <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center text-white">
              {nextMedia.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    nextMedia.poster
                  }
                  alt={
                    nextMedia.title ||
                    "Next session"
                  }
                  className="mb-4 max-h-[42vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              )}

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Up next in{" "}
                {
                  nextCountdown
                }
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                {nextMedia.title ||
                  "Next session"}
              </h3>

              <p className="mt-2 text-sm text-white/70">
                Starting automatically
                in this player.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={
                    playNextMedia
                  }
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-50"
                >
                  Play now
                </button>

                <button
                  type="button"
                  onClick={
                    cancelNextVideo
                  }
                  className="rounded-full border border-white/30 bg-black/25 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}