import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getMedia } from "@/lib/media/media-service";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}) {
  const {
    categoryError,
    mediaError,
    programError,
  } = await searchParams;

  const supabase =
    await createClient();

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  // --------------------------------------------------
  // ADMIN ROLE CHECK
  // --------------------------------------------------

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    roleError ||
    roleRecord?.role !== "admin"
  ) {
    redirect("/");
  }

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  const [
    {
      data: stats,
      error: statsError,
    },

    {
      data: categories,
      error: categoriesError,
    },

    {
      data: moods,
      error: moodsError,
    },

    {
      data: videoMoodRows,
      error: videoMoodsError,
    },

    {
      data: programs,
      error: programsError,
    },

    {
      data: programVideoRows,
      error: programVideosError,
    },

    mediaResult,
  ] = await Promise.all([
    supabase.rpc(
      "admin_dashboard_analytics"
    ),

    supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug
        `
      )
      .order("name"),

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
      .from("video_moods")
      .select(
        `
        video_id,
        mood_id
        `
      ),

    supabase
      .from("programs")
      .select(
        `
        id,
        title,
        slug,
        description,
        thumbnail_url,
        is_published,
        created_at,
        updated_at
        `
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      ),

    supabase
      .from("program_videos")
      .select(
        `
        program_id,
        video_id,
        position,
        created_at
        `
      )
      .order(
        "position",
        {
          ascending: true,
        }
      ),

    getMedia(),
  ]);

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  if (statsError) {
    console.error(
      "Admin analytics error:",
      statsError
    );

    throw new Error(
      statsError.message
    );
  }

  if (categoriesError) {
    console.error(
      "Admin categories error:",
      categoriesError
    );

    throw new Error(
      categoriesError.message
    );
  }

  if (moodsError) {
    console.error(
      "Admin moods error:",
      moodsError
    );

    throw new Error(
      moodsError.message
    );
  }

  if (videoMoodsError) {
    console.error(
      "Admin video moods error:",
      videoMoodsError
    );

    throw new Error(
      videoMoodsError.message
    );
  }

  if (programsError) {
    console.error(
      "Admin programs error:",
      programsError
    );

    throw new Error(
      programsError.message
    );
  }

  if (programVideosError) {
    console.error(
      "Admin program videos error:",
      programVideosError
    );

    throw new Error(
      programVideosError.message
    );
  }

  // --------------------------------------------------
  // NORMALISE MEDIA
  // --------------------------------------------------

  const media =
    Array.isArray(mediaResult)
      ? mediaResult
      : [];

  // --------------------------------------------------
  // MOOD RELATIONSHIPS
  // --------------------------------------------------

  const moodMap =
    new Map();

  for (
    const row of
    videoMoodRows || []
  ) {
    if (
      !moodMap.has(
        row.video_id
      )
    ) {
      moodMap.set(
        row.video_id,
        []
      );
    }

    moodMap
      .get(row.video_id)
      .push(row.mood_id);
  }

  // --------------------------------------------------
  // PROGRAM RELATIONSHIPS
  // --------------------------------------------------

  const programMap =
    new Map();

  for (
    const row of
    programVideoRows || []
  ) {
    if (
      !programMap.has(
        row.video_id
      )
    ) {
      programMap.set(
        row.video_id,
        []
      );
    }

    programMap
      .get(row.video_id)
      .push(row.program_id);
  }

  // --------------------------------------------------
  // MEDIA WITH MOODS + PROGRAMS
  // --------------------------------------------------

  const mediaWithRelations =
    media.map((item) => ({
      ...item,

      mood_ids:
        moodMap.get(
          item.id
        ) || [],

      program_ids:
        programMap.get(
          item.id
        ) || [],
    }));

  // --------------------------------------------------
  // PROGRAMS WITH ORDERED VIDEOS
  // --------------------------------------------------

  const programsWithVideos =
    (programs || []).map(
      (program) => {
        const videos =
          (
            programVideoRows || []
          )
            .filter(
              (row) =>
                row.program_id ===
                program.id
            )
            .sort(
              (a, b) =>
                a.position -
                b.position
            )
            .map((row) => {
              const video =
                mediaWithRelations.find(
                  (item) =>
                    item.id ===
                    row.video_id
                );

              if (!video) {
                return null;
              }

              return {
                ...video,
                position:
                  row.position,
              };
            })
            .filter(Boolean);

        return {
          ...program,
          videos,
        };
      }
    );

  // --------------------------------------------------
  // RENDER ADMIN DASHBOARD
  // --------------------------------------------------

  return (
    <AdminDashboardClient
      stats={stats}

      categories={
        categories || []
      }

      moods={
        moods || []
      }

      media={
        mediaWithRelations
      }

      programs={
        programsWithVideos
      }

      categoryError={
        categoryError || null
      }

      mediaError={
        mediaError || null
      }

      programError={
        programError || null
      }
    />
  );
}