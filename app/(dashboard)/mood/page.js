import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import MediaRow from "@/components/video/MediaRow";

/*
 * Visual styling stays in the application.
 *
 * The actual mood names, descriptions,
 * emojis and video relationships now come
 * from Supabase.
 */
const MOOD_STYLES = {
  calm:
    "border-emerald-100 bg-emerald-50 hover:border-emerald-300",

  anxious:
    "border-orange-100 bg-orange-50 hover:border-orange-300",

  stressed:
    "border-rose-100 bg-rose-50 hover:border-rose-300",

  sleepy:
    "border-violet-100 bg-violet-50 hover:border-violet-300",

  focused:
    "border-sky-100 bg-sky-50 hover:border-sky-300",

  low:
    "border-teal-100 bg-teal-50 hover:border-teal-300",

  energised:
    "border-amber-100 bg-amber-50 hover:border-amber-300",

  overwhelmed:
    "border-cyan-100 bg-cyan-50 hover:border-cyan-300",

  positive:
    "border-yellow-100 bg-yellow-50 hover:border-yellow-300",

  break:
    "border-lime-100 bg-lime-50 hover:border-lime-300",
};

async function createSignedUrl(
  supabase,
  path,
  expiresIn
) {
  if (!path) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from("videos")
    .createSignedUrl(
      path,
      expiresIn
    );

  if (error) {
    console.error(
      "Could not create signed mood media URL:",
      error
    );

    return null;
  }

  return (
    data?.signedUrl ??
    null
  );
}

function MoodCard({
  mood,
  active,
}) {
  const classes =
    MOOD_STYLES[
      mood.slug
    ] ||
    "border-slate-200 bg-white hover:border-emerald-300";

  return (
    <Link
      href={`/mood?mood=${encodeURIComponent(
        mood.slug
      )}`}
      className={`group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-100"
          : classes
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {mood.emoji ||
            "◌"}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">
            {mood.name}
          </h2>

          {mood.description && (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {
                mood.description
              }
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function MoodPage({
  searchParams,
}) {
  const {
    mood: selectedSlug =
      "",
  } = await searchParams;

  const supabase =
    await createClient();

  /*
   * Load the three pieces separately:
   *
   * 1. available moods
   * 2. published media
   * 3. real admin-selected
   *    video/mood relationships
   */
  const [
    {
      data: rawMoods,
      error: moodsError,
    },

    {
      data: rawVideos,
      error: videosError,
    },

    {
      data: videoMoodRows,
      error:
        videoMoodsError,
    },
  ] = await Promise.all([
    supabase
      .from("moods")
      .select(
        `
        id,
        name,
        slug,
        emoji,
        description
        `
      )
      .order("name"),

    supabase
      .from("videos")
      .select(
        `
        id,
        title,
        description,
        instructor,
        duration_minutes,
        thumbnail_url,
        video_url,
        category_id,
        created_at,
        is_published,
        categories(
          id,
          name,
          slug
        )
        `
      )
      .eq(
        "is_published",
        true
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      ),

    supabase
      .from(
        "video_moods"
      )
      .select(
        `
        video_id,
        mood_id
        `
      ),
  ]);

  if (moodsError) {
    throw new Error(
      moodsError.message
    );
  }

  if (videosError) {
    throw new Error(
      videosError.message
    );
  }

  if (
    videoMoodsError
  ) {
    throw new Error(
      videoMoodsError.message
    );
  }

  const moods =
    rawMoods || [];

  /*
   * Create the temporary secure
   * thumbnail + preview URLs.
   */
  const videos =
    await Promise.all(
      (
        rawVideos || []
      ).map(
        async (
          video
        ) => {
          const [
            thumbnailUrl,
            previewUrl,
          ] =
            await Promise.all([
              createSignedUrl(
                supabase,
                video.thumbnail_url,
                3600
              ),

              createSignedUrl(
                supabase,
                video.video_url,
                1800
              ),
            ]);

          return {
            id:
              video.id,

            title:
              video.title,

            description:
              video.description,

            instructor:
              video.instructor,

            durationMinutes:
              video.duration_minutes,

            thumbnailUrl,

            previewUrl,

            category:
              video.categories ??
              null,
          };
        }
      )
    );

  /*
   * Fast lookup:
   *
   * video ID
   *    ↓
   * normalised video object
   */
  const videoMap =
    new Map(
      videos.map(
        (video) => [
          video.id,
          video,
        ]
      )
    );

  /*
   * mood ID
   *    ↓
   * [video, video, ...]
   */
  const videosByMood =
    new Map();

  for (
    const moodItem of
    moods
  ) {
    videosByMood.set(
      moodItem.id,
      []
    );
  }

  for (
    const relation of
    videoMoodRows || []
  ) {
    const video =
      videoMap.get(
        relation.video_id
      );

    if (!video) {
      continue;
    }

    const current =
      videosByMood.get(
        relation.mood_id
      );

    if (!current) {
      continue;
    }

    /*
     * Prevent accidental
     * duplicate cards.
     */
    if (
      !current.some(
        (item) =>
          item.id ===
          video.id
      )
    ) {
      current.push(
        video
      );
    }
  }

  const selectedMood =
    moods.find(
      (item) =>
        item.slug ===
        selectedSlug
    ) || null;

  const selectedVideos =
    selectedMood
      ? videosByMood.get(
          selectedMood.id
        ) || []
      : [];

  /*
   * Only show a full media row
   * for moods that currently
   * have assigned media.
   *
   * All mood buttons still remain
   * visible at the top.
   */
  const moodRows =
    moods
      .map(
        (
          moodItem
        ) => ({
          mood:
            moodItem,

          videos:
            videosByMood.get(
              moodItem.id
            ) || [],
        })
      )
      .filter(
        (row) =>
          row.videos
            .length > 0
      );

  return (
    <div className="pb-12">
      {/* INTRO */}

      <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-6 py-7 shadow-sm sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          MindSettle Mood
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          How are you
          feeling right now?
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Choose what feels
          closest to your
          current mood and
          discover sessions
          selected to support
          that moment.
        </p>
      </section>

      {/* MOOD OPTIONS */}

      <section className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {moods.map(
            (
              moodItem
            ) => (
              <MoodCard
                key={
                  moodItem.id
                }
                mood={
                  moodItem
                }
                active={
                  selectedMood
                    ?.id ===
                  moodItem.id
                }
              />
            )
          )}
        </div>
      </section>

      {/* SELECTED MOOD */}

      {selectedMood && (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Selected mood
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {selectedMood.emoji}{" "}
                {
                  selectedMood.name
                }
              </h2>

              {selectedMood.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {
                    selectedMood.description
                  }
                </p>
              )}
            </div>

            <Link
              href="/mood"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Clear mood
            </Link>
          </div>

          {selectedVideos.length >
          0 ? (
            <MediaRow
              videos={
                selectedVideos
              }
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="font-semibold text-slate-800">
                No sessions
                have been
                assigned to
                this mood yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                An administrator
                can assign media
                to this mood from
                Media Management.
              </p>
            </div>
          )}
        </section>
      )}

      {/* DISCOVER ASSIGNED MOODS */}

      {!selectedMood && (
        <div className="mt-12 space-y-10">
          {moodRows.length >
          0 ? (
            moodRows.map(
              (row) => (
                <section
                  key={
                    row.mood.id
                  }
                >
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        {
                          row.mood
                            .emoji
                        }{" "}
                        {
                          row.mood
                            .name
                        }
                      </h2>

                      {row.mood
                        .description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {
                            row.mood
                              .description
                          }
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/mood?mood=${encodeURIComponent(
                        row.mood
                          .slug
                      )}`}
                      className="shrink-0 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
                    >
                      See all →
                    </Link>
                  </div>

                  <MediaRow
                    videos={
                      row.videos
                    }
                  />
                </section>
              )
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="font-semibold text-slate-800">
                No media has
                been assigned
                to moods yet.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Assign moods
                while uploading
                or editing media
                in the Admin
                Dashboard.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}