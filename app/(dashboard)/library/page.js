import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import MediaRow from "@/components/video/MediaRow";
import FeaturedHero from "@/components/video/FeaturedHero";

/* =========================================================
   WATCH PROGRESS
========================================================= */

function calculateProgress(
  progressSeconds,
  durationMinutes
) {
  if (!progressSeconds || !durationMinutes) {
    return 0;
  }

  const totalSeconds =
    Number(durationMinutes) * 60;

  if (!totalSeconds) {
    return 0;
  }

  return Math.round(
    (progressSeconds / totalSeconds) * 100
  );
}

/* =========================================================
   PRIVATE SIGNED STORAGE URL
========================================================= */

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

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  subtitle,
  href,
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#163d34] sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm leading-5 text-[#5a6d66]">
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-[#163d34] transition hover:bg-[#dce8ca]/70 hover:text-[#12372f] focus:outline-none focus:ring-2 focus:ring-[#b7d889]"
        >
          See all →
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   MOOD CARD

   Preview D hover effect:
   - slight lift
   - emerald glow
   - brighter icon
   - arrow movement
========================================================= */

function MoodCard({
  mood,
  sessionCount = 0,
}) {
  const sessionLabel =
    sessionCount === 1
      ? "1 session"
      : `${sessionCount} sessions`;

  return (
    <Link
      href={`/mood?mood=${encodeURIComponent(
        mood.slug
      )}`}
      aria-label={`${mood.name}, ${sessionLabel}`}
      title={`${mood.name} · ${sessionLabel}`}
      className="
        group
        relative
        flex
        h-full
        w-full
        min-w-0
        items-center
        gap-3
        overflow-hidden
        rounded-[18px]
        border
        border-[#cfd8cb]
        bg-[#fffdfa]/95
        px-4
        shadow-[0_6px_20px_rgba(18,55,47,0.06)]
        backdrop-blur-md
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#9bb98a]
        hover:bg-[#eef3e8]
        hover:shadow-[0_16px_34px_rgba(18,55,47,0.14)]

        focus:outline-none
        focus:ring-2
        focus:ring-[#b7d889]
      "
    >
      {/* HOVER GLOW */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-[#dce8ca]/0
          blur-2xl
          transition-all
          duration-300

          group-hover:bg-[#dce8ca]/70
        "
      />

      {/* ICON */}

      <span
        className="
          relative
          z-10
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#eef3e8]
          text-xl
          shadow-sm
          transition-all
          duration-300

          group-hover:scale-110
          group-hover:bg-white
          group-hover:shadow-md
        "
      >
        {mood.emoji || "✦"}
      </span>

      {/* NAME */}

      <span className="relative z-10 min-w-0 flex-1 truncate text-sm font-bold text-[#29383e] transition group-hover:text-[#163d34]">
        {mood.name}
      </span>

      {/* ARROW */}

      <span
        aria-hidden="true"
        className="
          relative
          z-10
          shrink-0
          text-lg
          text-slate-300
          transition-all
          duration-300

          group-hover:translate-x-1
          group-hover:text-[#163d34]
        "
      >
        →
      </span>
    </Link>
  );
}

/* =========================================================
   EMPTY SLOT

   If fewer than 18 moods exist, the design does not stretch.
========================================================= */

function EmptyMoodSlot() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full"
    />
  );
}

/* =========================================================
   MOOD SLOT
========================================================= */

function MoodSlot({
  mood,
  moodSessionCounts,
}) {
  if (!mood) {
    return <EmptyMoodSlot />;
  }

  return (
    <MoodCard
      mood={mood}
      sessionCount={
        moodSessionCounts[
          mood.id
        ] ?? 0
      }
    />
  );
}

/* =========================================================
   EXACT 18-SLOT MOOD FRAME

   5 TOP
   4 LEFT
   4 RIGHT
   5 BOTTOM

   Mood #19+ goes to More moods.
========================================================= */

function getMoodFrame(moods) {
  return {
    top: moods.slice(0, 5),

    left: moods.slice(5, 9),

    right: moods.slice(9, 13),

    bottom: moods.slice(13, 18),

    extra: moods.slice(18),
  };
}

/* =========================================================
   FIXED SLOT ARRAY
========================================================= */

function makeFixedSlots(
  moods,
  size
) {
  return Array.from(
    {
      length: size,
    },
    (_, index) =>
      moods[index] ?? null
  );
}

/* =========================================================
   WELLNESS HERO

   DESKTOP:

   [Mood] [Mood] [Mood] [Mood] [Mood]

   [Mood]  ┌────────────────────────────┐ [Mood]
   [Mood]  │                            │ [Mood]
   [Mood]  │      FEATURED HERO         │ [Mood]
   [Mood]  │                            │ [Mood]
           └────────────────────────────┘

   [Mood] [Mood] [Mood] [Mood] [Mood]
========================================================= */

function WellnessHero({
  moods,
  featured,
  moodSessionCounts,
}) {
  const {
    top,
    left,
    right,
    bottom,
    extra,
  } =
    getMoodFrame(
      moods
    );

  const topSlots =
    makeFixedSlots(
      top,
      5
    );

  const leftSlots =
    makeFixedSlots(
      left,
      4
    );

  const rightSlots =
    makeFixedSlots(
      right,
      4
    );

  const bottomSlots =
    makeFixedSlots(
      bottom,
      5
    );

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-[#cfd8cb]/90
        bg-[#f5f5ed]/95
        px-5
        py-3
        shadow-[0_18px_55px_rgba(18,55,47,0.08)]

        sm:px-6
        lg:px-7
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#dce8ca]/35 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#dfe8d6]/50 blur-3xl" />

      {/* =================================================
          HEADING
      ================================================= */}

      <div className="relative z-10">
        <h1
          className="
            max-w-[1200px]
            text-3xl
            font-bold
            tracking-tight
            text-[#163d34]

            sm:text-[32px]
            lg:text-[34px]
            lg:leading-[1.06]

            xl:text-[36px]
          "
        >
          Choose the Mood to get started for{" "}
          <span className="whitespace-nowrap">
            your wellbeing.
          </span>
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-5 text-[#5a6d66] sm:text-[15px]">
          Find a moment to settle with sessions selected to support how you feel.
        </p>
      </div>

      {/* =================================================
          DESKTOP
      ================================================= */}

      <div className="relative z-10 mx-auto mt-4 hidden w-full max-w-[1420px] lg:block">
        {/* =================================================
            TOP 5
        ================================================= */}

        <div className="grid grid-cols-5 gap-2">
          {topSlots.map(
            (
              mood,
              index
            ) => (
              <div
                key={
                  mood?.id ??
                  `top-empty-${index}`
                }
                className="h-[64px]"
              >
                <MoodSlot
                  mood={mood}
                  moodSessionCounts={
                    moodSessionCounts
                  }
                />
              </div>
            )
          )}
        </div>

        {/* =================================================
            MIDDLE
        ================================================= */}

        <div
          className="
            mt-2
            grid
            gap-2
          "
          style={{
            gridTemplateColumns:
              "220px minmax(0, 1fr) 220px",
          }}
        >
          {/* ===============================================
              LEFT 4
          =============================================== */}

          <div className="grid grid-rows-4 gap-2">
            {leftSlots.map(
              (
                mood,
                index
              ) => (
                <div
                  key={
                    mood?.id ??
                    `left-empty-${index}`
                  }
                  className="h-[66px]"
                >
                  <MoodSlot
                    mood={mood}
                    moodSessionCounts={
                      moodSessionCounts
                    }
                  />
                </div>
              )
            )}
          </div>

          {/* ===============================================
              LARGE CENTRE FEATURED HERO
          =============================================== */}

          <div
            className="
              relative
              min-w-0
              overflow-hidden
              rounded-[24px]
            "
            style={{
              height:
                "288px",
            }}
          >
            <div className="pointer-events-none absolute inset-2 rounded-[28px] bg-[#dce8ca]/40 blur-2xl" />

            <div
              className="
                relative
                z-10
                h-full
                w-full

                [&>*]:h-full
                [&>*]:w-full
                [&>*]:max-w-none
              "
            >
              <FeaturedHero
                featured={
                  featured
                }
              />
            </div>
          </div>

          {/* ===============================================
              RIGHT 4
          =============================================== */}

          <div className="grid grid-rows-4 gap-2">
            {rightSlots.map(
              (
                mood,
                index
              ) => (
                <div
                  key={
                    mood?.id ??
                    `right-empty-${index}`
                  }
                  className="h-[66px]"
                >
                  <MoodSlot
                    mood={mood}
                    moodSessionCounts={
                      moodSessionCounts
                    }
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* =================================================
            BOTTOM 5
        ================================================= */}

        <div className="mt-2 grid grid-cols-5 gap-2">
          {bottomSlots.map(
            (
              mood,
              index
            ) => (
              <div
                key={
                  mood?.id ??
                  `bottom-empty-${index}`
                }
                className="h-[64px]"
              >
                <MoodSlot
                  mood={mood}
                  moodSessionCounts={
                    moodSessionCounts
                  }
                />
              </div>
            )
          )}
        </div>

        {/* =================================================
            EXTRA MOODS — MOOD #19+
        ================================================= */}

        {extra.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#cfd8cb]" />

              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[#6c8178]">
                More moods
              </p>

              <div className="h-px flex-1 bg-[#cfd8cb]" />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {extra.map(
                (mood) => (
                  <div
                    key={
                      mood.id
                    }
                    className="h-[82px] w-[220px]"
                  >
                    <MoodCard
                      mood={mood}
                      sessionCount={
                        moodSessionCounts[
                          mood.id
                        ] ?? 0
                      }
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          TABLET / MOBILE
      ================================================= */}

      <div className="relative z-10 mt-5 lg:hidden">
        <div className="mx-auto w-full max-w-3xl">
          <FeaturedHero
            featured={
              featured
            }
          />
        </div>

        {moods.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {moods.map(
              (mood) => (
                <div
                  key={
                    mood.id
                  }
                  className="h-[76px]"
                >
                  <MoodCard
                    mood={mood}
                    sessionCount={
                      moodSessionCounts[
                        mood.id
                      ] ?? 0
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   LIBRARY PAGE
========================================================= */

export default async function LibraryPage({
  searchParams,
}) {
  const resolvedSearchParams =
    searchParams
      ? await searchParams
      : {};

  const {
    q = "",
    category = "",
  } =
    resolvedSearchParams;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  /* ======================================================
     CATEGORIES
  ====================================================== */

  const {
    data: categories,
    error: categoriesError,
  } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug"
      )
      .order("name");

  if (categoriesError) {
    console.error(
      "Could not load categories:",
      categoriesError
    );
  }

  /* ======================================================
     MOODS

     These are REAL moods from Supabase.

     Admin-added moods automatically appear here.
  ====================================================== */

  const {
    data: moodData,
    error: moodsError,
  } =
    await supabase
      .from("moods")
      .select(
        `
        id,
        name,
        slug,
        emoji,
        description,
        created_at
        `
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (moodsError) {
    console.error(
      "Could not load moods:",
      moodsError
    );
  }

  const moods =
    moodData || [];

  /* ======================================================
     VIDEO ↔ MOOD RELATIONSHIPS
  ====================================================== */

  const {
    data: videoMoodData,
    error: videoMoodError,
  } =
    await supabase
      .from("video_moods")
      .select(
        `
        video_id,
        mood_id
        `
      );

  if (videoMoodError) {
    console.error(
      "Could not load video mood relationships:",
      videoMoodError
    );
  }

  const videoMoodLinks =
    videoMoodData || [];

  /* ======================================================
     MOOD SESSION COUNT
  ====================================================== */

  const moodSessionCounts = {};

  videoMoodLinks.forEach(
    (link) => {
      moodSessionCounts[
        link.mood_id
      ] =
        (
          moodSessionCounts[
            link.mood_id
          ] || 0
        ) + 1;
    }
  );

  /* ======================================================
     VIDEOS
  ====================================================== */

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
      .eq("is_published", true)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (q) {
    videosQuery =
      videosQuery.ilike(
        "title",
        `%${q}%`
      );
  }

  const {
    data: rawVideos,
    error: videosError,
  } =
    await videosQuery;

  if (videosError) {
    throw new Error(
      videosError.message
    );
  }

  /* ======================================================
     SIGNED MEDIA
  ====================================================== */

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

            createdAt:
              video.created_at,

            category:
              video.categories ??
              null,
          };
        }
      )
    );

  /* ======================================================
     CATEGORY FILTER
  ====================================================== */

  let filteredVideos =
    videos;

  if (category) {
    filteredVideos =
      videos.filter(
        (video) =>
          video.category
            ?.slug ===
          category
      );
  }

  /* ======================================================
     WATCH HISTORY
  ====================================================== */

  let watchHistory = [];

  if (user) {
    const {
      data: historyData,
      error: historyError,
    } =
      await supabase
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

  /* ======================================================
     VIDEO LOOKUP
  ====================================================== */

  const videoMap =
    Object.fromEntries(
      videos.map(
        (video) => [
          video.id,
          video,
        ]
      )
    );

  /* ======================================================
     PROGRESS
  ====================================================== */

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

  /* ======================================================
     CONTINUE WATCHING
  ====================================================== */

  const continueWatching =
    watchHistory
      .filter(
        (history) =>
          !history.completed &&
          history.progress_seconds > 0
      )
      .map(
        (history) =>
          videoMap[
            history.video_id
          ]
      )
      .filter(Boolean);

  /* ======================================================
     RECENTLY ADDED
  ====================================================== */

  const recentlyAdded =
    filteredVideos.slice(
      0,
      12
    );

  /* ======================================================
     CATEGORY ROWS
  ====================================================== */

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

  /* ======================================================
     FEATURED
  ====================================================== */

  const featured =
    filteredVideos[0] ||
    videos[0] ||
    null;

  const hasSearch =
    Boolean(q);

  /* ======================================================
     PAGE
  ====================================================== */

  return (
    <div className="relative pb-16">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed left-0 top-20 -z-10 h-[320px] w-[320px] rounded-full bg-[#dce8ca]/35 blur-3xl" />

      <div className="space-y-8">
        {/* =================================================
            SEARCH HEADER
        ================================================= */}

        {hasSearch && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#cfd8cb] bg-[#fffdfa] px-6 py-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#78906f]">
                Search results
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#163d34]">
                Results for “{q}”
              </h1>

              <p className="mt-1 text-sm text-[#5a6d66]">
                {filteredVideos.length} result
                {filteredVideos.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <Link
              href="/library"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#eef3e8]"
            >
              Clear search
            </Link>
          </section>
        )}

        {/* =================================================
            NO RESULTS
        ================================================= */}

        {hasSearch &&
        filteredVideos.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-[#163d34]">
              No sessions found
            </h2>

            <p className="mt-2 text-sm text-[#5a6d66]">
              We could not find a session matching “{q}”.
            </p>
          </section>
        ) : (
          <>
            {/* =================================================
                MOOD + FEATURED HERO
            ================================================= */}

            {!hasSearch && (
              <WellnessHero
                moods={
                  moods
                }
                featured={
                  featured
                }
                moodSessionCounts={
                  moodSessionCounts
                }
              />
            )}

            {/* =================================================
                SEARCH HERO
            ================================================= */}

            {hasSearch && (
              <FeaturedHero
                featured={
                  featured
                }
              />
            )}

            {/* =================================================
                CONTINUE WATCHING
            ================================================= */}

            {!hasSearch &&
              continueWatching.length > 0 && (
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

            {/* =================================================
                SEARCH RESULTS
            ================================================= */}

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

            {/* =================================================
                RECENTLY ADDED
            ================================================= */}

            {!hasSearch && (
              <section>
                <SectionHeader
                  title="Recently added"
                  subtitle="New sessions to bring a little more calm into your day."
                />

                <MediaRow
                  videos={
                    recentlyAdded
                  }
                />
              </section>
            )}

            {/* =================================================
                CATEGORY ROWS
            ================================================= */}

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

            {/* =================================================
                CATEGORY SHORTCUTS
            ================================================= */}

            {!hasSearch &&
              categoryRows.length > 0 && (
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
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-[#eef3e8]"
                        >
                          <p className="text-sm font-semibold text-[#163d34]">
                            {
                              row.category.name
                            }
                          </p>

                          <p className="mt-1 text-xs font-medium text-[#5a6d66]">
                            {row.videos.length}{" "}
                            session
                            {row.videos.length === 1
                              ? ""
                              : "s"}
                          </p>
                        </Link>
                      )
                    )}
                  </div>
                </section>
              )}

            {/* =================================================
                BOTTOM CARDS
            ================================================= */}

            {!hasSearch && (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Link
                  href="/programs"
                  className="rounded-2xl border border-[#cfd8cb] bg-[#dce8ca]/65 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-[#163d34]">
                    Create space for calm
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#5a6d66]">
                    Gentle routines can help make calm part of your everyday life.
                  </p>

                  <p className="mt-4 text-xs font-semibold text-[#163d34]">
                    Explore Programs →
                  </p>
                </Link>

                <Link
                  href="/favourites"
                  className="rounded-2xl border border-[#cfd8cb] bg-[#dfe8d6]/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-[#163d34]">
                    Keep what helps close
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#5a6d66]">
                    Save the sessions you want to return to whenever you need them.
                  </p>

                  <p className="mt-4 text-xs font-semibold text-[#163d34]">
                    View Favourites →
                  </p>
                </Link>

                <div className="rounded-2xl border border-[#cfd8cb] bg-[#f5f5ed] p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[#163d34]">
                    Make room for yourself
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#5a6d66]">
                    A few quiet moments can make space for the rest of your day.
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
