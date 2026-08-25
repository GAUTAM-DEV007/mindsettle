import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import MediaRow from "@/components/video/MediaRow";
import { resolveCatalogueAccess } from "@/lib/access/entitlement";

/* =========================================================
   VISUAL MOOD STYLES

   Actual moods still come from Supabase.
========================================================= */

const MOOD_STYLES = {
  calm:
    "border-[#cfd8cb] bg-[#eef3e8] hover:border-[#9bb98a]",

  anxious:
    "border-[#d9d7c9] bg-[#f5f5ed] hover:border-[#a9b798]",

  stressed:
    "border-[#d8d2c8] bg-[#f4eee8] hover:border-[#b6a795]",

  sleepy:
    "border-[#d4d9cf] bg-[#eef1ed] hover:border-[#a7b69d]",

  focused:
    "border-[#cad7d1] bg-[#e8f0ec] hover:border-[#8fa69a]",

  low:
    "border-[#cad8cf] bg-[#edf3ee] hover:border-[#91a895]",

  energised:
    "border-[#ddd8bf] bg-[#f4f1df] hover:border-[#b7ad7d]",

  overwhelmed:
    "border-[#cbd8d4] bg-[#eaf1ee] hover:border-[#8da49c]",

  positive:
    "border-[#dedbc7] bg-[#f5f3e7] hover:border-[#b4ad82]",

  break:
    "border-[#d1d9c3] bg-[#eef2e6] hover:border-[#9eac88]",
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
    "border-[#cfd8cb] bg-[#fffdfa] hover:border-[#9bb98a]";

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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fffdfa] text-xl shadow-sm">
          {mood.emoji || "◌"}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#163d34]">
            {mood.name}
          </h2>

          {mood.description && (
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#5a6d66]">
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
      <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#163d34] sm:text-2xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-[#6c8178]">
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
          is_premium,
          min_tier,
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

  const moodPageAccess = await resolveCatalogueAccess(
    supabase,
    user,
    rawVideos || []
  );

  const videos =
    await Promise.all(
      (
        rawVideos || []
      ).map(
        async (
          video
        ) => {
          const videoAccess =
            moodPageAccess.get(video.id) ?? {
              allowed: false,
              requiresUpgrade: true,
            };

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

              videoAccess.allowed
                ? createSignedUrl(
                    supabase,
                    video.video_url,
                    1800
                  )
                : Promise.resolve(null),
            ]);

          return {
            id:
              video.id,

            locked: !videoAccess.allowed,

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

          <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-[#dfe8d6] via-[#f5f5ed] to-[#eef3e8] px-6 py-6 shadow-sm sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
              A moment for you
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163d34] sm:text-3xl">
              What feels closest to you right now?
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a6d66]">
              Choose the feeling that best matches this moment and explore sessions created to help you settle.
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
                        <h2 className="text-xl font-semibold text-[#163d34]">
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
                          <p className="mt-1 text-sm text-[#5a6d66]">
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
                        className="shrink-0 text-sm font-semibold text-[#163d34] transition hover:text-[#78906f]"
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
              <div className="rounded-2xl border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-12 text-center">
                <p className="font-semibold text-[#29383e]">
                  No media has been assigned to moods yet.
                </p>

                <p className="mt-1 text-sm text-[#6c8178]">
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
              border-[#cfd8cb]
              bg-gradient-to-r
              from-[#dfe8d6]
              via-[#f5f5ed]
              to-[#eef3e8]
              px-5
              py-4
              shadow-sm

              sm:px-6
            "
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fffdfa] text-2xl shadow-sm">
                  {
                    selectedMood.emoji ||
                    "◌"
                  }
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78906f]">
                    Selected mood
                  </p>

                  <h1 className="mt-0.5 text-2xl font-semibold tracking-[-0.03em] text-[#163d34]">
                    {
                      selectedMood.name
                    }
                  </h1>

                  {selectedMood.description && (
                    <p className="mt-1 max-w-2xl text-sm text-[#5a6d66]">
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
                  border-[#cfd8cb]
                  bg-[#fffdfa]
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-[#163d34]
                  shadow-sm
                  transition

                  hover:border-[#9bb98a]
                  hover:bg-[#dce8ca]/60
                  hover:text-[#12372f]
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
              subtitle="Sessions selected to support how this moment feels."
            />

            {selectedVideos.length >
            0 ? (
              <MediaRow
                videos={
                  selectedVideos
                }
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-[#fffdfa] px-6 py-10 text-center">
                <p className="font-semibold text-[#29383e]">
                  No sessions have been assigned to this mood yet.
                </p>

                <p className="mt-1 text-sm text-[#6c8178]">
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
                subtitle="Return to sessions you spent time with recently."
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
                subtitle="More sessions that may feel right for this moment."
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
            <section className="mt-10 border-t border-[#cfd8cb] pt-8">
              <SectionTitle
                title="Explore another moment"
                subtitle="Explore sessions connected to other moods whenever you feel ready for something different."
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
                          <h3 className="text-lg font-semibold text-[#163d34]">
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
                          className="shrink-0 text-sm font-semibold text-[#163d34] transition hover:text-[#78906f]"
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