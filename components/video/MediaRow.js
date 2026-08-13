"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import VideoCard from "@/components/video/VideoCard";

const EDGE_SIZE = 120;
const MAX_SCROLL_SPEED = 10;

export default function MediaRow({
  videos = [],
  progressMap = {},
}) {
  const rowRef = useRef(null);
  const animationRef = useRef(null);
  const scrollSpeedRef = useRef(0);

  const [leftActive, setLeftActive] =
    useState(false);

  const [rightActive, setRightActive] =
    useState(false);

  /*
   * Continuous smooth scrolling.
   *
   * The actual speed is controlled
   * by where the pointer is inside
   * the row.
   */
  useEffect(() => {
    function animate() {
      const row = rowRef.current;

      if (
        row &&
        scrollSpeedRef.current !== 0
      ) {
        row.scrollLeft +=
          scrollSpeedRef.current;
      }

      animationRef.current =
        requestAnimationFrame(animate);
    }

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, []);

  function stopEdgeScroll() {
    scrollSpeedRef.current = 0;

    setLeftActive(false);
    setRightActive(false);
  }

  function handlePointerMove(event) {
    /*
     * Touch users should use normal
     * swipe scrolling.
     */
    if (
      event.pointerType === "touch"
    ) {
      stopEdgeScroll();
      return;
    }

    const row = rowRef.current;

    if (!row) {
      return;
    }

    const rect =
      row.getBoundingClientRect();

    const pointerX =
      event.clientX - rect.left;

    const distanceFromLeft =
      pointerX;

    const distanceFromRight =
      rect.width - pointerX;

    /*
     * LEFT SIDE
     */

    if (
      distanceFromLeft < EDGE_SIZE
    ) {
      const strength =
        1 -
        distanceFromLeft /
          EDGE_SIZE;

      const speed =
        Math.max(
          2,
          strength *
            MAX_SCROLL_SPEED
        );

      scrollSpeedRef.current =
        -speed;

      setLeftActive(true);
      setRightActive(false);

      return;
    }

    /*
     * RIGHT SIDE
     */

    if (
      distanceFromRight < EDGE_SIZE
    ) {
      const strength =
        1 -
        distanceFromRight /
          EDGE_SIZE;

      const speed =
        Math.max(
          2,
          strength *
            MAX_SCROLL_SPEED
        );

      scrollSpeedRef.current =
        speed;

      setLeftActive(false);
      setRightActive(true);

      return;
    }

    /*
     * POINTER IS IN THE MIDDLE
     */

    stopEdgeScroll();
  }

  if (!videos?.length) {
    return null;
  }

  return (
    <div
      className="relative"
      onPointerLeave={
        stopEdgeScroll
      }
    >
      {/* LEFT FADE */}

      <div
        className={`pointer-events-none absolute bottom-4 left-0 top-0 z-30 w-20 bg-gradient-to-r from-[#f8faf8] via-[#f8faf8]/70 to-transparent transition-opacity duration-200 ${
          leftActive
            ? "opacity-100"
            : "opacity-0"
        }`}
      />

      {/* LEFT DIRECTION */}

      {leftActive && (
        <div className="pointer-events-none absolute left-3 top-[38%] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-2xl font-semibold text-emerald-800 shadow-lg backdrop-blur">
          ‹
        </div>
      )}

      {/* VIDEO ROW */}

      <div
        ref={rowRef}
        onPointerMove={
          handlePointerMove
        }
        onPointerLeave={
          stopEdgeScroll
        }
        className="
          -mx-1
          flex
          gap-4
          overflow-x-auto
          px-1
          pb-4
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {videos
          .filter(Boolean)
          .map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              progressPercent={
                progressMap[
                  video.id
                ] ?? null
              }
            />
          ))}
      </div>

      {/* RIGHT FADE */}

      <div
        className={`pointer-events-none absolute bottom-4 right-0 top-0 z-30 w-20 bg-gradient-to-l from-[#f8faf8] via-[#f8faf8]/70 to-transparent transition-opacity duration-200 ${
          rightActive
            ? "opacity-100"
            : "opacity-0"
        }`}
      />

      {/* RIGHT DIRECTION */}

      {rightActive && (
        <div className="pointer-events-none absolute right-3 top-[38%] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-2xl font-semibold text-emerald-800 shadow-lg backdrop-blur">
          ›
        </div>
      )}
    </div>
  );
}