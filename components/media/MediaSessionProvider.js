"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const MediaSessionContext =
  createContext(null);

const VALID_MODES =
  new Set([
    "full",
    "mini",
    "hidden",
    "closed",
  ]);

const DEFAULT_SESSION = {
  sessionId: 0,

  media: null,

  mode: "closed",

  isPlaying: false,

  currentTime: 0,

  volume: 1,

  muted: false,

  playbackRate: 1,

  /*
   * Used when a hover/card preview
   * temporarily takes audio priority.
   */
  previewActive: false,

  resumeAfterPreview: false,
};

/* =========================================================
   HELPERS
========================================================= */

function clampVolume(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.min(
    1,
    Math.max(
      0,
      number
    )
  );
}

function normaliseTime(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return number;
}

function normalisePlaybackRate(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.min(
    4,
    Math.max(
      0.25,
      number
    )
  );
}

/* =========================================================
   PROVIDER
========================================================= */

export function MediaSessionProvider({
  children,
}) {
  const sessionCounterRef =
    useRef(0);

  const [
    session,
    setSession,
  ] = useState(
    DEFAULT_SESSION
  );

  /* ======================================================
     START / REPLACE MEDIA

     Starting another full media item automatically
     replaces the previous session. This gives us one
     site-wide active media session.
  ====================================================== */

  const startMedia = useCallback(
    (
      media,
      options = {}
    ) => {
      if (!media) {
        return;
      }

      sessionCounterRef.current +=
        1;

      const newSessionId =
        sessionCounterRef.current;

      setSession(
        (current) => ({
          sessionId:
            newSessionId,

          media,

          mode:
            VALID_MODES.has(
              options.mode
            )
              ? options.mode
              : "full",

          isPlaying:
            options.autoplay ??
            true,

          currentTime:
            normaliseTime(
              options.currentTime
            ),

          /*
           * Keep the user's existing
           * volume unless explicitly
           * overridden.
           */
          volume:
            options.volume !==
            undefined
              ? clampVolume(
                  options.volume
                )
              : current.volume,

          muted:
            options.muted !==
            undefined
              ? Boolean(
                  options.muted
                )
              : current.muted,

          playbackRate:
            options.playbackRate !==
            undefined
              ? normalisePlaybackRate(
                  options.playbackRate
                )
              : current.playbackRate,

          previewActive:
            false,

          resumeAfterPreview:
            false,
        })
      );
    },
    []
  );

  /* ======================================================
     PLAYER MODE
  ====================================================== */

  const setMode = useCallback(
    (mode) => {
      if (
        !VALID_MODES.has(mode)
      ) {
        return;
      }

      setSession(
        (current) => {
          if (
            !current.media &&
            mode !== "closed"
          ) {
            return current;
          }

          return {
            ...current,
            mode,
          };
        }
      );
    },
    []
  );

  /* ======================================================
     PLAY / PAUSE STATE
  ====================================================== */

  const setPlaying = useCallback(
    (isPlaying) => {
      setSession(
        (current) => ({
          ...current,

          isPlaying:
            Boolean(
              isPlaying
            ),
        })
      );
    },
    []
  );

  /* ======================================================
     CURRENT TIME
  ====================================================== */

  const updateCurrentTime =
    useCallback(
      (
        currentTime,
        sessionId = null
      ) => {
        setSession(
          (current) => {
            /*
             * If a player sends a stale
             * update after another video
             * has started, ignore it.
             */
            if (
              sessionId !== null &&
              sessionId !==
                current.sessionId
            ) {
              return current;
            }

            return {
              ...current,

              currentTime:
                normaliseTime(
                  currentTime
                ),
            };
          }
        );
      },
      []
    );

  /* ======================================================
     VOLUME / MUTE
  ====================================================== */

  const updateVolume =
    useCallback(
      (
        volume,
        muted
      ) => {
        setSession(
          (current) => ({
            ...current,

            volume:
              clampVolume(
                volume
              ),

            muted:
              muted ===
              undefined
                ? current.muted
                : Boolean(
                    muted
                  ),
          })
        );
      },
      []
    );

  const setMuted =
    useCallback(
      (muted) => {
        setSession(
          (current) => ({
            ...current,

            muted:
              Boolean(
                muted
              ),
          })
        );
      },
      []
    );

  /* ======================================================
     PLAYBACK SPEED
  ====================================================== */

  const setPlaybackRate =
    useCallback(
      (playbackRate) => {
        setSession(
          (current) => ({
            ...current,

            playbackRate:
              normalisePlaybackRate(
                playbackRate
              ),
          })
        );
      },
      []
    );

  /* ======================================================
     MINI / HIDDEN / RESTORE
  ====================================================== */

  const hidePlayer = useCallback(
    () => {
      setSession(
        (current) => {
          if (
            !current.media
          ) {
            return current;
          }

          return {
            ...current,

            mode:
              "hidden",
          };
        }
      );
    },
    []
  );

  const showMiniPlayer =
    useCallback(
      () => {
        setSession(
          (current) => {
            if (
              !current.media
            ) {
              return current;
            }

            return {
              ...current,

              mode:
                "mini",
            };
          }
        );
      },
      []
    );

  /* ======================================================
     PREVIEW AUDIO ARBITRATION

     When a hover preview starts with sound:

     1. remember whether full media was playing
     2. mark the full session paused
     3. preview receives audio priority

     When preview ends:
     restore playback only if the same session
     is still active and nothing replaced it.
  ====================================================== */

  const beginPreview =
    useCallback(() => {
      setSession(
        (current) => {
          if (
            !current.media ||
            current.previewActive
          ) {
            return current;
          }

          return {
            ...current,

            previewActive:
              true,

            resumeAfterPreview:
              current.isPlaying,

            isPlaying:
              false,
          };
        }
      );
    }, []);

  const endPreview =
    useCallback(() => {
      setSession(
        (current) => {
          if (
            !current.previewActive
          ) {
            return current;
          }

          return {
            ...current,

            previewActive:
              false,

            isPlaying:
              current
                .resumeAfterPreview,

            resumeAfterPreview:
              false,
          };
        }
      );
    }, []);

  /* ======================================================
     CLOSE SESSION
  ====================================================== */

  const closePlayer =
    useCallback(() => {
      setSession(
        (current) => ({
          ...DEFAULT_SESSION,

          /*
           * Keep preferences ready for
           * the next media item.
           */
          sessionId:
            current.sessionId,

          volume:
            current.volume,

          muted:
            current.muted,

          playbackRate:
            current.playbackRate,
        })
      );
    }, []);

  /* ======================================================
     CONTEXT
  ====================================================== */

  const value = useMemo(
    () => ({
      session,

      startMedia,

      setMode,

      setPlaying,

      updateCurrentTime,

      updateVolume,

      setMuted,

      setPlaybackRate,

      hidePlayer,

      showMiniPlayer,

      beginPreview,

      endPreview,

      closePlayer,
    }),
    [
      session,

      startMedia,

      setMode,

      setPlaying,

      updateCurrentTime,

      updateVolume,

      setMuted,

      setPlaybackRate,

      hidePlayer,

      showMiniPlayer,

      beginPreview,

      endPreview,

      closePlayer,
    ]
  );

  return (
    <MediaSessionContext.Provider
      value={value}
    >
      {children}
    </MediaSessionContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useMediaSession() {
  const context =
    useContext(
      MediaSessionContext
    );

  if (!context) {
    throw new Error(
      "useMediaSession must be used inside MediaSessionProvider."
    );
  }

  return context;
}
