"use client";

import MediaRow from "@/components/video/MediaRow";

export default function HorizontalVideoRow({
  videos = [],
  progressMap = {},
}) {
  return (
    <MediaRow
      videos={videos}
      progressMap={progressMap}
    />
  );
}