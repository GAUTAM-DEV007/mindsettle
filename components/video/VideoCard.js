import Link from "next/link";

export default function VideoCard({ video }) {
  const {
    id,
    title,
    instructor,
    durationMinutes,
    thumbnailUrl,
  } = video;

  return (
    <Link
      href={`/library/${id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition hover:border-neutral-700 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-neutral-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-xl text-emerald-400">
              ▶
            </div>

            <p className="mt-3 text-xs">
              No thumbnail available
            </p>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          <div className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-black/70 text-lg text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
            ▶
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-neutral-400">
          {instructor}
          {" · "}
          {durationMinutes} min
        </p>
      </div>
    </Link>
  );
}