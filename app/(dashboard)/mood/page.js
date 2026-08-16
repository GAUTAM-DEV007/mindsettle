import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import MediaRow from "@/components/video/MediaRow";

/* =========================================================
   VISUAL MOOD STYLES

   Actual moods still come from Supabase.
========================================================= */

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

/* =========================================================
   PRIVATE SIGNED URL
========================================================= */

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
  } =
    await supabase.storage
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

/* =========================================================
   MOOD CARD
========================================================= */

function MoodCard({
  mood,
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
      className={`
        group
        rounded-2xl
        border
        p-4
        shadow-sm
        transition

        hover:-translate-y-0.5
        hover:shadow-md

        ${classes}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {mood.emoji || "◌"}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">
            {mood.name}
          </h2>

          {mood.description && (
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
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

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
  subtitle,
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MOOD PAGE
========================================================= */

export default async function MoodPage({
  searchParams,
}) {
  const {
    mood: selectedSlug =
      "",
  } =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  /* ======================================================
     LOAD DATA
  ====================================================== */

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
  ] =
    await Promise.all([
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
            ascending: false,
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

  /* ======================================================
     SIGNED MEDIA
  ====================================================== */

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

            categoryId:
              video.category_id ??
              null,

            createdAt:
              video.created_at,
          };
        }
      )
    );

  /* ======================================================
     VIDEO LOOKUP
  ====================================================== */

  const videoMap =
    new Map(
      videos.map(
        (
          video
        ) => [
          video.id,
          video,
        ]
      )
    );

  /* ======================================================
     VIDEOS BY MOOD
  ====================================================== */

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

    if (
      !current.some(
        (
          item
        ) =>
          item.id ===
          video.id
      )
    ) {
      current.push(
        video
      );
    }
  }

  /* ======================================================
     SELECTED MOOD
  ====================================================== */

  const selectedMood =
    moods.find(
      (
        item
      ) =>
        item.slug ===
        selectedSlug
    ) || null;

  const selectedVideos =
    selectedMood
      ? videosByMood.get(
          selectedMood.id
        ) || []
      : [];

  const selectedVideoIds =
    new Set(
      selectedVideos.map(
        (
          video
        ) =>
          video.id
      )
    );

  /* ======================================================
     RECENTLY WATCHED

     Only shown after a mood is selected.
  ====================================================== */

  let recentlyWatched =
    [];

  if (
    user &&
    selectedMood
  ) {
    const {
      data:
        historyData,
      error:
        historyError,
    } =
      await supabase
        .from(
          "watch_history"
        )
        .select(
          `
          video_id,
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
            ascending:
              false,
          }
        )
        .limit(12);

    if (historyError) {
      console.error(
        "Could not load recent mood watch history:",
        historyError
      );
    } else {
      const seen =
        new Set();

      recentlyWatched =
        (
          historyData || []
        )
          .map(
            (
              history
            ) =>
              videoMap.get(
                history.video_id
              )
          )
          .filter(Boolean)
          .filter(
            (
              video
            ) => {
              if (
                seen.has(
                  video.id
                )
              ) {
                return false;
              }

              seen.add(
                video.id
              );

              return true;
            }
          );
    }
  }

  /* ======================================================
     MORE LIKE THIS

     Prefer videos that share the category of a video
     assigned to the selected mood.

     Selected mood videos themselves are excluded.
  ====================================================== */

  let moreLikeThis =
    [];

  if (selectedMood) {
    const selectedCategoryIds =
      new Set(
        selectedVideos
          .map(
            (
              video
            ) =>
              video.categoryId
          )
          .filter(Boolean)
      );

    moreLikeThis =
      videos
        .filter(
          (
            video
          ) =>
            !selectedVideoIds.has(
              video.id
            )
        )
        .filter(
          (
            video
          ) =>
            selectedCategoryIds.size ===
              0 ||
            selectedCategoryIds.has(
              video.categoryId
            )
        )
        .slice(
          0,
          12
        );

    /* ====================================================
       FALLBACK

       If category matching produces nothing,
       show recent videos outside the selected mood.
    ==================================================== */

    if (
      moreLikeThis.length ===
      0
    ) {
      moreLikeThis =
        videos
          .filter(
            (
              video
            ) =>
              !selectedVideoIds.has(
                video.id
              )
          )
          .slice(
            0,
            12
          );
    }
  }

  /* ======================================================
     OTHER MOOD ROWS

     Used lower down after the selected mood content.
  ====================================================== */

  const otherMoodRows =
    selectedMood
      ? moods
          .filter(
            (
              moodItem
            ) =>
              moodItem.id !==
              selectedMood.id
          )
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
            (
              row
            ) =>
              row.videos
                .length > 0
          )
      : [];

  /* ======================================================
     MOOD ROWS — NO MOOD SELECTED
  ====================================================== */

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
        (
          row
        ) =>
          row.videos
            .length > 0
      );

  /* ======================================================
     PAGE
  ====================================================== */

  return (
    <div className="pb-12">
      {/* =================================================
          NO MOOD SELECTED

          Show normal mood selection screen.
      ================================================= */}

      {!selectedMood && (
        <>
          {/* INTRO */}

          <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-6 py-6 shadow-sm sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              MindSettle Mood
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              How are you feeling right now?
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Choose what feels closest to your current mood and discover sessions selected to support that moment.
            </p>
          </section>

          {/* MOOD OPTIONS */}

          <section className="mt-5">
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
                  />
                )
              )}
            </div>
          </section>

          {/* ALL ASSIGNED MOODS */}

          <div className="mt-10 space-y-10">
            {moodRows.length >
            0 ? (
              moodRows.map(
                (
                  row
                ) => (
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
                  No media has been assigned to moods yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Assign moods while uploading or editing media in the Admin Dashboard.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* =================================================
          SELECTED MOOD

          IMPORTANT:
          All other mood cards are hidden.
      ================================================= */}

      {selectedMood && (
        <>
          {/* COMPACT SELECTED MOOD HEADER */}

          <section
            className="
              rounded-[26px]
              border
              border-emerald-200
              bg-gradient-to-r
              from-emerald-50
              via-white
              to-sky-50
              px-5
              py-4
              shadow-sm

              sm:px-6
            "
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {
                    selectedMood.emoji ||
                    "◌"
                  }
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Selected mood
                  </p>

                  <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-950">
                    {
                      selectedMood.name
                    }
                  </h1>

                  {selectedMood.description && (
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">
                      {
                        selectedMood.description
                      }
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/mood"
                className="
                  shrink-0
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  transition

                  hover:border-emerald-300
                  hover:bg-emerald-50
                  hover:text-emerald-800
                "
              >
                Change mood
              </Link>
            </div>
          </section>

          {/* =================================================
              1. SELECTED MOOD VIDEOS
          ================================================= */}

          <section className="mt-6">
            <SectionTitle
              title={`${selectedMood.emoji || "◌"} Sessions for ${selectedMood.name}`}
              subtitle="Sessions selected specifically for how you are feeling right now."
            />

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
                  No sessions have been assigned to this mood yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  An administrator can assign media to this mood from Media Management.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              2. RECENTLY WATCHED
          ================================================= */}

          {recentlyWatched.length >
            0 && (
            <section className="mt-9">
              <SectionTitle
                title="Recently watched"
                subtitle="Continue with sessions you have viewed recently."
              />

              <MediaRow
                videos={
                  recentlyWatched
                }
              />
            </section>
          )}

          {/* =================================================
              3. MORE LIKE THIS
          ================================================= */}

          {moreLikeThis.length >
            0 && (
            <section className="mt-9">
              <SectionTitle
                title="More like this"
                subtitle="More MindSettle sessions that may suit this moment."
              />

              <MediaRow
                videos={
                  moreLikeThis
                }
              />
            </section>
          )}

          {/* =================================================
              4. EXPLORE OTHER MOODS

              No giant mood-card grid.
              Just their actual media rows.
          ================================================= */}

          {otherMoodRows.length >
            0 && (
            <section className="mt-10 border-t border-slate-200 pt-8">
              <SectionTitle
                title="Explore more wellbeing sessions"
                subtitle="Sessions connected to other moods when you are ready for something different."
              />

              <div className="space-y-10">
                {otherMoodRows.map(
                  (
                    row
                  ) => (
                    <section
                      key={
                        row.mood.id
                      }
                    >
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {
                              row.mood
                                .emoji
                            }{" "}
                            {
                              row.mood
                                .name
                            }
                          </h3>
                        </div>

                        <Link
                          href={`/mood?mood=${encodeURIComponent(
                            row.mood
                              .slug
                          )}`}
                          className="shrink-0 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
                        >
                          View mood →
                        </Link>
                      </div>

                      <MediaRow
                        videos={
                          row.videos
                        }
                      />
                    </section>
                  )
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}