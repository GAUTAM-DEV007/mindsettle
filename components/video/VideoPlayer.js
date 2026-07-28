"use client";

export default function VideoPlayer({ src, poster, title }) {
  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      controls
      poster={poster}
      title={title}
      src={src}
    >
      Your browser does not support the video tag.
    </video>
  );
}
