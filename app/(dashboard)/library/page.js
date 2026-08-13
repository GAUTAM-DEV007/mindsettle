import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MediaRow from "@/components/video/MediaRow";
import FeaturedHero from "@/components/video/FeaturedHero";

const MOODS = [
  {
    label: "Calm",
    emoji: "🌿",
    value: "calm",
    description: "Find your calm",
    classes:
      "border-emerald-100 bg-emerald-50/90 text-emerald-900",
    descriptionClasses:
      "text-emerald-700",
  },
  {
    label: "Sleep",
    emoji: "🌙",
    value: "sleep",
    description: "Wind down & rest",
    classes:
      "border-violet-100 bg-violet-50/90 text-violet-900",
    descriptionClasses:
      "text-violet-700",
  },
  {
    label: "Stress Relief",
    emoji: "🍂",
    value: "stress",
    description: "Release & relax",
    classes:
      "border-rose-100 bg-rose-50/90 text-rose-900",
    descriptionClasses:
      "text-rose-700",
  },
  {
    label: "Focus",
    emoji: "◎",
    value: "focus",
    description: "Stay present & sharp",
    classes:
      "border-sky-100 bg-sky-50/90 text-sky-900",
    descriptionClasses:
      "text-sky-700",
  },
  {
    label: "Energy",
    emoji: "☀️",
    value: "energy",
    description: "Feel uplifted & alive",
    classes:
      "border-amber-100 bg-amber-50/90 text-amber-900",
    descriptionClasses:
      "text-amber-700",
  },
  {
    label: "Ease Anxiety",
    emoji: "🫶",
    value: "anxiety",
    description: "Find steady ground",
    classes:
      "border-orange-100 bg-orange-50/90 text-orange-900",
    descriptionClasses:
      "text-orange-700",
  },
];

function calculateProgress(
  progressSeconds,
  durationMinutes
) {
  if (
    !progressSeconds ||
    !durationMinutes
  ) {
    return 0;
  }

  const totalSeconds =
    Number(durationMinutes) * 60;

  if (!totalSeconds) {
    return 0;
  }

  return Math.round(
    (progressSeconds /
      totalSeconds) *
      100
  );
}

async function createSignedStorageUrl(
  supabase,
  path,
  expiresIn = 3600
) {
  if (!path) {
    return null;
  }

  const { data, error } =
    await supabase.storage
      .from("videos")
      .createSignedUrl(
        path,
        expiresIn
      );

  if (error) {
    console.error(
      `Could not create signed URL for ${path}:`,
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}

function SectionHeader({
  title,
  subtitle,
  href,
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          See all →
        </Link>
      )}
    </div>
  );
}

function MoodSelector({
  selectedMood,
}) {
  return (
    <aside className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        Your wellbeing
      </p>

      <h1 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-slate-950">
        What would help

        <span className="block text-emerald-800">
          you right now?
        </span>
      </h1>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        Choose a mood to discover
        sessions that may suit your
        moment.
      </p>

      <div className="mt-4 space-y-2">
        {MOODS.map((item) => {
          const active =
            selectedMood ===
            item.value;

          return (
            <Link
              key={item.value}
              href={`/library?mood=${item.value}`}
              className={`flex min-h-[48px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                active
                  ? "border-emerald-400 bg-emerald-100 shadow-sm"
                  : item.classes
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-base shadow-sm">
                  {item.emoji}
                </span>

                <span className="truncate text-xs font-bold sm:text-sm">
                  {item.label}
                </span>
              </div>

              <span
                className={`shrink-0 text-[10px] font-medium sm:text-xs ${
                  active
                    ? "text-emerald-800"
                    : item.descriptionClasses
                }`}
              >
                {item.description}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default async function LibraryPage({
  searchParams,
}) {
  const {
    q = "",
    category = "",
    mood = "",
  } = await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  /*
   * CATEGORIES
   */

  const { data: categories } =
    await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

  /*
   * VIDEOS
   */

  let videosQuery =
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
        created_at,
        categories(
          id,
          name,
          slug
        )
        `
      )
      .order("created_at", {
        ascending: false,
      });

  if (q) {
    videosQuery =
      videosQuery.ilike(
        "title",
        `%${q}%`
      );
  }

  const {
    data: rawVideos,
    error,
  } = await videosQuery;

  if (error) {
    throw new Error(
      error.message
    );
  }

  /*
   * PRIVATE SIGNED MEDIA
   */

  const videos =
    await Promise.all(
      (rawVideos || []).map(
        async (video) => {
          const [
            thumbnailUrl,
            previewUrl,
          ] =
            await Promise.all([
              createSignedStorageUrl(
                supabase,
                video.thumbnail_url,
                3600
              ),

              createSignedStorageUrl(
                supabase,
                video.video_url,
                1800
              ),
            ]);

          return {
            id: video.id,

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

            createdAt:
              video.created_at,

            category:
              video.categories ??
              null,
          };
        }
      )
    );

  /*
   * CATEGORY FILTER
   */

  let filteredVideos =
    videos;

  if (category) {
    filteredVideos =
      videos.filter(
        (video) =>
          video.category?.slug ===
          category
      );
  }

  /*
   * TEMPORARY MOOD MATCHING
   */

  const moodWords = {
    calm: [
      "calm",
      "relax",
      "nature",
      "meditation",
    ],

    sleep: [
      "sleep",
      "night",
      "relax",
      "meditation",
    ],

    stress: [
      "stress",
      "relax",
      "calm",
      "nature",
      "breathing",
    ],

    focus: [
      "focus",
      "mindfulness",
      "meditation",
    ],

    energy: [
      "energy",
      "morning",
      "movement",
      "nature",
    ],

    anxiety: [
      "anxiety",
      "calm",
      "breathing",
      "nature",
    ],
  };

  let moodVideos = [];

  if (mood) {
    const words =
      moodWords[mood] || [];

    moodVideos =
      videos.filter(
        (video) => {
          const searchable = `
            ${video.title || ""}
            ${
              video.description ||
              ""
            }
            ${
              video.category
                ?.name || ""
            }
          `.toLowerCase();

          return words.some(
            (word) =>
              searchable.includes(
                word
              )
          );
        }
      );
  }

  /*
   * WATCH HISTORY
   */

  let watchHistory = [];

  if (user) {
    const {
      data: historyData,
      error: historyError,
    } = await supabase
      .from("watch_history")
      .select(
        `
        video_id,
        progress_seconds,
        completed,
        watched_at
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "watched_at",
        {
          ascending: false,
        }
      );

    if (historyError) {
      console.error(
        "Could not load watch history:",
        historyError
      );
    } else {
      watchHistory =
        historyData || [];
    }
  }

  /*
   * VIDEO LOOKUP
   */

  const videoMap =
    Object.fromEntries(
      videos.map(
        (video) => [
          video.id,
          video,
        ]
      )
    );

  /*
   * PROGRESS
   */

  const progressMap = {};

  watchHistory.forEach(
    (history) => {
      const video =
        videoMap[
          history.video_id
        ];

      if (!video) {
        return;
      }

      progressMap[
        history.video_id
      ] =
        calculateProgress(
          history.progress_seconds,
          video.durationMinutes
        );
    }
  );

  /*
   * CONTINUE WATCHING
   */

  const continueWatching =
    watchHistory
      .filter(
        (history) =>
          !history.completed &&
          history.progress_seconds >
            0
      )
      .map(
        (history) =>
          videoMap[
            history.video_id
          ]
      )
      .filter(Boolean);

  /*
   * RECENTLY ADDED
   */

  const recentlyAdded =
    filteredVideos.slice(
      0,
      12
    );

  /*
   * CATEGORY ROWS
   */

  const categoryRows =
    (categories || [])
      .map(
        (categoryItem) => ({
          category:
            categoryItem,

          videos:
            filteredVideos.filter(
              (video) =>
                video.category
                  ?.id ===
                categoryItem.id
            ),
        })
      )
      .filter(
        (row) =>
          row.videos.length > 0
      );

  /*
   * FEATURED
   */

  const featured =
    moodVideos[0] ||
    filteredVideos[0] ||
    videos[0] ||
    null;

  const hasSearch =
    Boolean(q);

  return (
    <div className="relative pb-16">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f8faf8]" />

      <div className="pointer-events-none fixed left-0 top-20 -z-10 h-[320px] w-[320px] rounded-full bg-emerald-100/20 blur-3xl" />

      <div className="space-y-8">

        {/* SEARCH */}

        {hasSearch && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Search results
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Results for “{q}”
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                {
                  filteredVideos.length
                }{" "}
                result
                {filteredVideos.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <Link
              href="/library"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-emerald-50"
            >
              Clear search
            </Link>
          </section>
        )}

        {/* NO RESULTS */}

        {hasSearch &&
        filteredVideos.length ===
          0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              No sessions found
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              We could not find a
              session matching “{q}”.
            </p>
          </section>
        ) : (
          <>

            {/* MOOD + HERO */}

            {!hasSearch && (
              <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
                <MoodSelector
                  selectedMood={
                    mood
                  }
                />

                <FeaturedHero
                  featured={
                    featured
                  }
                />
              </section>
            )}

            {/* SEARCH HERO */}

            {hasSearch && (
              <FeaturedHero
                featured={
                  featured
                }
              />
            )}

            {/* MOOD RESULTS */}

            {!hasSearch &&
              mood &&
              moodVideos.length >
                0 && (
                <section>
                  <SectionHeader
                    title={
                      MOODS.find(
                        (item) =>
                          item.value ===
                          mood
                      )?.label ||
                      "Selected mood"
                    }
                    subtitle="Sessions that may suit how you feel right now."
                    href="/library"
                  />

                  <MediaRow
                    videos={
                      moodVideos
                    }
                  />
                </section>
              )}

            {/* CONTINUE */}

            {!hasSearch &&
              continueWatching.length >
                0 && (
                <section>
                  <SectionHeader
                    title="Continue your journey"
                    subtitle="Pick up where you left off."
                  />

                  <MediaRow
                    videos={
                      continueWatching
                    }
                    progressMap={
                      progressMap
                    }
                  />
                </section>
              )}

            {/* SEARCH RESULTS */}

            {hasSearch && (
              <section>
                <SectionHeader
                  title="Matching sessions"
                />

                <MediaRow
                  videos={
                    filteredVideos
                  }
                />
              </section>
            )}

            {/* RECENTLY ADDED */}

            {!hasSearch && (
              <section>
                <SectionHeader
                  title="Recently added"
                  subtitle="Fresh sessions to support your wellbeing."
                />

                <MediaRow
                  videos={
                    recentlyAdded
                  }
                />
              </section>
            )}

            {/* CATEGORY ROWS */}

            {!hasSearch &&
              categoryRows.map(
                (row) => (
                  <section
                    key={
                      row.category.id
                    }
                  >
                    <SectionHeader
                      title={
                        row.category.name
                      }
                      href={`/library?category=${row.category.slug}`}
                    />

                    <MediaRow
                      videos={
                        row.videos
                      }
                    />
                  </section>
                )
              )}

            {/* CATEGORY SHORTCUTS */}

            {!hasSearch &&
              categoryRows.length >
                0 && (
                <section>
                  <SectionHeader
                    title="Browse by category"
                  />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {categoryRows.map(
                      (row) => (
                        <Link
                          key={
                            row.category.id
                          }
                          href={`/library?category=${row.category.slug}`}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
                        >
                          <p className="text-sm font-bold text-slate-900">
                            {
                              row.category.name
                            }
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {
                              row.videos.length
                            }{" "}
                            session
                            {row.videos.length ===
                            1
                              ? ""
                              : "s"}
                          </p>
                        </Link>
                      )
                    )}
                  </div>
                </section>
              )}

            {/* BOTTOM CARDS */}

            {!hasSearch && (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Link
                  href="/programs"
                  className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-bold text-emerald-900">
                    Build a daily habit
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Small steps every day
                    create lasting change.
                  </p>

                  <p className="mt-4 text-xs font-bold text-emerald-800">
                    Explore Programs →
                  </p>
                </Link>

                <Link
                  href="/favourites"
                  className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-bold text-slate-900">
                    Save your favourites
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Create your own
                    collection of sessions.
                  </p>

                  <p className="mt-4 text-xs font-bold text-emerald-800">
                    View Favourites →
                  </p>
                </Link>

                <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">
                    You matter
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Take care of your
                    mind, your body, and
                    your life.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}