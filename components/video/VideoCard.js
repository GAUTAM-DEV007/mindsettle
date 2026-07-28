import Link from "next/link";

export default function VideoCard({ video }) {
  const { id, title, instructor, durationMinutes, thumbnailUrl } = video;

  return (
    <Link
      href={`/library/${id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 transition-shadow hover:shadow-md"
    >
      <div className="aspect-video w-full bg-neutral-100">
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {instructor} &middot; {durationMinutes} min
        </p>
      </div>
    </Link>
  );
}
