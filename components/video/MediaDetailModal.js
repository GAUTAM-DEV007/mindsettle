"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function MediaDetailModal({
  children,
}) {
  const router = useRouter();

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-[rgba(33,63,52,0.22)] px-3 py-5 backdrop-blur-xl sm:px-6 sm:py-8"
      onMouseDown={closeModal}
    >
      <div
        className="relative mx-auto min-h-[80vh] w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#f5f5ed_0%,#edf3e8_55%,#e6eee4_100%)] shadow-[0_35px_120px_rgba(18,55,47,0.18)]"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close media details"
          className="absolute right-4 top-4 z-[120] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xl text-white backdrop-blur-md transition hover:bg-black/75"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
