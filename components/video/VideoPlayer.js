"use client";

import { useRef, useState } from "react";

export default function VideoPlayer({
  src,
  poster,
  title,
}) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);

  const [started, setStarted] =
    useState(false);

  /*
   * Start playback from an explicit
   * user interaction and request
   * fullscreen immediately.
   */
  async function handleStart() {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;

    if (!video || !wrapper) {
      return;
    }

    setStarted(true);

    try {
      /*
       * Fullscreen must be requested
       * from a user gesture.
       *
       * Request fullscreen first while
       * still inside the click event.
       */
      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
      } else if (
        video.webkitEnterFullscreen
      ) {
        video.webkitEnterFullscreen();
      }

      await video.play();
    } catch (error) {
      console.error(
        "Could not start fullscreen playback:",
        error
      );

      /*
       * If fullscreen is unavailable,
       * still allow normal playback.
       */
      try {
        await video.play();
      } catch (playError) {
        console.error(
          "Could not play video:",
          playError
        );
      }
    }
  }

  /*
   * Prevent the normal browser
   * right-click menu on the player.
   *
   * This discourages casual
   * "Save video as..." behaviour.
   *
   * This is NOT DRM and should not
   * be treated as complete protection.
   */
  function handleContextMenu(event) {
    event.preventDefault();
  }

  return (
    <div
      ref={wrapperRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl"
      onContextMenu={
        handleContextMenu
      }
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        controls={started}

        /*
         * Remove browser-provided
         * download and remote playback
         * controls where supported.
         */
        controlsList="nodownload noremoteplayback"

        /*
         * Disable Picture-in-Picture
         * because this is protected
         * subscription content.
         */
        disablePictureInPicture

        /*
         * Disable remote playback /
         * casting where supported.
         */
        disableRemotePlayback

        /*
         * Keep playback inside the
         * application on mobile until
         * fullscreen is requested.
         */
        playsInline

        /*
         * Load metadata without trying
         * to preload the entire video.
         */
        preload="metadata"

        poster={
          poster || undefined
        }

        title={title}

        src={src}

        onPlay={() =>
          setStarted(true)
        }
      >
        Your browser does not support
        the video tag.
      </video>

      {/* INITIAL PLAY SCREEN */}

      {!started && (
        <button
          type="button"
          onClick={handleStart}
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/10 transition hover:bg-black/20"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 pl-1 text-3xl text-emerald-700 shadow-2xl transition duration-300 hover:scale-110">
            ▶
          </span>
        </button>
      )}
    </div>
  );
}