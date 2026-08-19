"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  deleteMedia as deleteStoredMedia,
} from "@/lib/media/media-service";

/* =========================================================
   ADMIN AUTH
========================================================= */

async function requireAdminClient() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

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

  return supabase;
}

/* =========================================================
   ERROR HELPERS
========================================================= */

function redirectWithCategoryError(
  message
) {
  redirect(
    `/admin?categoryError=${encodeURIComponent(
      message
    )}`
  );
}

function redirectWithMediaError(
  message
) {
  redirect(
    `/admin?mediaError=${encodeURIComponent(
      message
    )}`
  );
}

function redirectWithProgramError(
  message
) {
  redirect(
    `/admin?programError=${encodeURIComponent(
      message
    )}`
  );
}

function checkboxValue(value) {
  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

/* =========================================================
   REVALIDATION HELPERS
========================================================= */

function revalidateMediaPages() {
  revalidatePath("/admin");
  revalidatePath("/library");
  revalidatePath("/mood");
  revalidatePath("/favourites");
  revalidatePath("/dashboard");
  revalidatePath("/programs");
}

function revalidateProgramPages(
  slug = null
) {
  revalidatePath("/admin");
  revalidatePath("/programs");
  revalidatePath("/library");

  if (slug) {
    revalidatePath(
      `/programs/${slug}`
    );
  }
}

/* =========================================================
   CATEGORY CRUD
========================================================= */

export async function addCategory(
  formData
) {
  const supabase =
    await requireAdminClient();

  const name =
    formData
      .get("name")
      ?.toString()
      .trim();

  const slug =
    formData
      .get("slug")
      ?.toString()
      .trim()
      .toLowerCase();

  if (!name || !slug) {
    redirectWithCategoryError(
      "Name and slug are required."
    );
  }

  const { error } =
    await supabase
      .from("categories")
      .insert({
        name,
        slug,
      });

  if (error) {
    redirectWithCategoryError(
      error.message
    );
  }

  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function updateCategory(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  const name =
    formData
      .get("name")
      ?.toString()
      .trim();

  const slug =
    formData
      .get("slug")
      ?.toString()
      .trim()
      .toLowerCase();

  if (
    !id ||
    !name ||
    !slug
  ) {
    redirectWithCategoryError(
      "Name and slug are required."
    );
  }

  const { error } =
    await supabase
      .from("categories")
      .update({
        name,
        slug,
      })
      .eq("id", id);

  if (error) {
    redirectWithCategoryError(
      error.message
    );
  }

  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function deleteCategory(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  if (!id) {
    redirectWithCategoryError(
      "Category id is required."
    );
  }

  const { error } =
    await supabase
      .from("categories")
      .delete()
      .eq("id", id);

  if (error) {
    redirectWithCategoryError(
      error.message
    );
  }

  revalidatePath("/admin");
  revalidatePath("/library");
}

/* =========================================================
   MEDIA UPDATE
========================================================= */

export async function updateMedia(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  const title =
    formData
      .get("title")
      ?.toString()
      .trim();

  const description =
    formData
      .get("description")
      ?.toString()
      .trim() || "";

  const instructor =
    formData
      .get("instructor")
      ?.toString()
      .trim() || "MindSettle";

  const categoryId =
    formData
      .get("categoryId")
      ?.toString() || "";

  const durationRaw =
    formData
      .get("durationMinutes")
      ?.toString();

  const durationMinutes =
    durationRaw
      ? Number(durationRaw)
      : null;

  const isPremium =
    checkboxValue(
      formData.get("isPremium")
    );

  const isFeatured =
    checkboxValue(
      formData.get("isFeatured")
    );

  const showOnHomepage =
    checkboxValue(
      formData.get(
        "showOnHomepage"
      )
    );

  const isPublished =
    checkboxValue(
      formData.get("isPublished")
    );

  const moodIds =
    formData
      .getAll("moodIds")
      .map((value) =>
        value.toString()
      )
      .filter(Boolean);

  if (!id) {
    redirectWithMediaError(
      "Media id is required."
    );
  }

  if (!title) {
    redirectWithMediaError(
      "Media title is required."
    );
  }

  if (
    durationMinutes !== null &&
    (
      !Number.isFinite(
        durationMinutes
      ) ||
      durationMinutes <= 0
    )
  ) {
    redirectWithMediaError(
      "Duration must be greater than zero."
    );
  }

  /* UPDATE VIDEO */

  const {
    error: updateError,
  } = await supabase
    .from("videos")
    .update({
      title,
      description,
      instructor,

      category_id:
        categoryId || null,

      duration_minutes:
        durationMinutes,

      is_premium:
        isPremium,

      min_tier:
        isPremium ? 1 : 0,

      is_featured:
        isFeatured,

      show_on_homepage:
        showOnHomepage,

      is_published:
        isPublished,
    })
    .eq("id", id);

  if (updateError) {
    redirectWithMediaError(
      updateError.message
    );
  }

  /* REPLACE MOOD ASSIGNMENTS */

  const {
    error: removeMoodError,
  } = await supabase
    .from("video_moods")
    .delete()
    .eq("video_id", id);

  if (removeMoodError) {
    redirectWithMediaError(
      removeMoodError.message
    );
  }

  if (moodIds.length > 0) {
    const moodRows =
      moodIds.map(
        (moodId) => ({
          video_id: id,
          mood_id: moodId,
        })
      );

    const {
      error:
        insertMoodError,
    } = await supabase
      .from("video_moods")
      .insert(moodRows);

    if (insertMoodError) {
      redirectWithMediaError(
        insertMoodError.message
      );
    }
  }

  revalidateMediaPages();
}

/* =========================================================
   MEDIA DELETE
========================================================= */

export async function deleteMediaRecord(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  if (!id) {
    redirectWithMediaError(
      "Media id is required."
    );
  }

  const {
    data: media,
    error: mediaError,
  } = await supabase
    .from("videos")
    .select(
      `
      id,
      video_url,
      thumbnail_url
      `
    )
    .eq("id", id)
    .single();

  if (
    mediaError ||
    !media
  ) {
    redirectWithMediaError(
      mediaError?.message ||
        "Media could not be found."
    );
  }

  /*
   * Deleting the video row also
   * removes its program_videos,
   * video_moods, favourites and
   * watch-history relationships
   * because those foreign keys use
   * ON DELETE CASCADE.
   */

  const {
    error: deleteDbError,
  } = await supabase
    .from("videos")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    redirectWithMediaError(
      deleteDbError.message
    );
  }

  /* DELETE ACTUAL MEDIA FILE */

  if (media.video_url) {
    try {
      await deleteStoredMedia({
        path:
          media.video_url,
      });
    } catch (error) {
      console.error(
        "Media database record was deleted, but the media file could not be removed:",
        error
      );
    }
  }

  /* DELETE THUMBNAIL */

  if (
    media.thumbnail_url &&
    media.thumbnail_url !==
      media.video_url
  ) {
    try {
      await deleteStoredMedia({
        path:
          media.thumbnail_url,
      });
    } catch (error) {
      console.error(
        "Media database record was deleted, but the thumbnail could not be removed:",
        error
      );
    }
  }

  revalidateMediaPages();
}

/* =========================================================
   PROGRAM CRUD
========================================================= */

export async function addProgram(
  formData
) {
  const supabase =
    await requireAdminClient();

  const title =
    formData
      .get("title")
      ?.toString()
      .trim();

  const slug =
    formData
      .get("slug")
      ?.toString()
      .trim()
      .toLowerCase();

  const description =
    formData
      .get("description")
      ?.toString()
      .trim() || "";

  const isPublished =
    checkboxValue(
      formData.get(
        "isPublished"
      )
    );

  if (!title || !slug) {
    redirectWithProgramError(
      "Program title and slug are required."
    );
  }

  const { error } =
    await supabase
      .from("programs")
      .insert({
        title,
        slug,
        description,

        is_published:
          isPublished,
      });

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  revalidateProgramPages(
    slug
  );
}

/* =========================================================
   PROGRAM UPDATE
========================================================= */

export async function updateProgram(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  const title =
    formData
      .get("title")
      ?.toString()
      .trim();

  const slug =
    formData
      .get("slug")
      ?.toString()
      .trim()
      .toLowerCase();

  const description =
    formData
      .get("description")
      ?.toString()
      .trim() || "";

  const isPublished =
    checkboxValue(
      formData.get(
        "isPublished"
      )
    );

  if (!id) {
    redirectWithProgramError(
      "Program id is required."
    );
  }

  if (!title || !slug) {
    redirectWithProgramError(
      "Program title and slug are required."
    );
  }

  const {
    data: oldProgram,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } =
    await supabase
      .from("programs")
      .update({
        title,
        slug,
        description,

        is_published:
          isPublished,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  if (
    oldProgram?.slug &&
    oldProgram.slug !== slug
  ) {
    revalidatePath(
      `/programs/${oldProgram.slug}`
    );
  }

  revalidateProgramPages(
    slug
  );
}

/* =========================================================
   PROGRAM DELETE
========================================================= */

export async function deleteProgram(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  if (!id) {
    redirectWithProgramError(
      "Program id is required."
    );
  }

  const {
    data: program,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } =
    await supabase
      .from("programs")
      .delete()
      .eq("id", id);

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  if (program?.slug) {
    revalidatePath(
      `/programs/${program.slug}`
    );
  }

  revalidateProgramPages();
}

/* =========================================================
   ADD VIDEO TO PROGRAM
========================================================= */

export async function addVideoToProgram(
  formData
) {
  const supabase =
    await requireAdminClient();

  const programId =
    formData
      .get("programId")
      ?.toString();

  const videoId =
    formData
      .get("videoId")
      ?.toString();

  if (
    !programId ||
    !videoId
  ) {
    redirectWithProgramError(
      "Program and media are required."
    );
  }

  /*
   * Prevent duplicate membership.
   */

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("program_videos")
    .select(
      "program_id, video_id"
    )
    .eq(
      "program_id",
      programId
    )
    .eq(
      "video_id",
      videoId
    )
    .maybeSingle();

  if (existingError) {
    redirectWithProgramError(
      existingError.message
    );
  }

  if (existing) {
    redirectWithProgramError(
      "This media is already in the program."
    );
  }

  /*
   * Put the new video at the end.
   */

  const {
    data: lastVideo,
    error: positionError,
  } = await supabase
    .from("program_videos")
    .select("position")
    .eq(
      "program_id",
      programId
    )
    .order(
      "position",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (positionError) {
    redirectWithProgramError(
      positionError.message
    );
  }

  const nextPosition =
    (
      lastVideo?.position ||
      0
    ) + 1;

  const { error } =
    await supabase
      .from("program_videos")
      .insert({
        program_id:
          programId,

        video_id:
          videoId,

        position:
          nextPosition,
      });

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  const {
    data: program,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", programId)
    .single();

  revalidateProgramPages(
    program?.slug
  );
}

/* =========================================================
   REMOVE VIDEO FROM PROGRAM
========================================================= */

export async function removeVideoFromProgram(
  formData
) {
  const supabase =
    await requireAdminClient();

  const programId =
    formData
      .get("programId")
      ?.toString();

  const videoId =
    formData
      .get("videoId")
      ?.toString();

  if (
    !programId ||
    !videoId
  ) {
    redirectWithProgramError(
      "Program and media are required."
    );
  }

  const { error } =
    await supabase
      .from("program_videos")
      .delete()
      .eq(
        "program_id",
        programId
      )
      .eq(
        "video_id",
        videoId
      );

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  /*
   * Re-number positions after
   * removing a video so there
   * are no gaps.
   */
  await normalizeProgramPositions(
    supabase,
    programId
  );

  const {
    data: program,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", programId)
    .single();

  revalidateProgramPages(
    program?.slug
  );
}

/* =========================================================
   MOVE PROGRAM VIDEO UP
========================================================= */

export async function moveProgramVideoUp(
  formData
) {
  const supabase =
    await requireAdminClient();

  const programId =
    formData
      .get("programId")
      ?.toString();

  const videoId =
    formData
      .get("videoId")
      ?.toString();

  if (
    !programId ||
    !videoId
  ) {
    redirectWithProgramError(
      "Program and media are required."
    );
  }

  await moveProgramVideo({
    supabase,
    programId,
    videoId,
    direction: -1,
  });

  const {
    data: program,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", programId)
    .single();

  revalidateProgramPages(
    program?.slug
  );
}

/* =========================================================
   MOVE PROGRAM VIDEO DOWN
========================================================= */

export async function moveProgramVideoDown(
  formData
) {
  const supabase =
    await requireAdminClient();

  const programId =
    formData
      .get("programId")
      ?.toString();

  const videoId =
    formData
      .get("videoId")
      ?.toString();

  if (
    !programId ||
    !videoId
  ) {
    redirectWithProgramError(
      "Program and media are required."
    );
  }

  await moveProgramVideo({
    supabase,
    programId,
    videoId,
    direction: 1,
  });

  const {
    data: program,
  } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", programId)
    .single();

  revalidateProgramPages(
    program?.slug
  );
}

/* =========================================================
   PROGRAM ORDER HELPER
========================================================= */

async function moveProgramVideo({
  supabase,
  programId,
  videoId,
  direction,
}) {
  const {
    data: rows,
    error,
  } = await supabase
    .from("program_videos")
    .select(
      `
      program_id,
      video_id,
      position,
      created_at
      `
    )
    .eq(
      "program_id",
      programId
    )
    .order(
      "position",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  const programVideos =
    rows || [];

  const currentIndex =
    programVideos.findIndex(
      (row) =>
        row.video_id ===
        videoId
    );

  if (currentIndex === -1) {
    redirectWithProgramError(
      "This media is not in the program."
    );
  }

  const targetIndex =
    currentIndex +
    direction;

  /*
   * Already at the top or bottom.
   */
  if (
    targetIndex < 0 ||
    targetIndex >=
      programVideos.length
  ) {
    return;
  }

  const current =
    programVideos[
      currentIndex
    ];

  const target =
    programVideos[
      targetIndex
    ];

  const currentPosition =
    current.position;

  const targetPosition =
    target.position;

  /*
   * Swap the two positions.
   */

  const {
    error:
      currentUpdateError,
  } = await supabase
    .from("program_videos")
    .update({
      position:
        targetPosition,
    })
    .eq(
      "program_id",
      programId
    )
    .eq(
      "video_id",
      current.video_id
    );

  if (
    currentUpdateError
  ) {
    redirectWithProgramError(
      currentUpdateError.message
    );
  }

  const {
    error:
      targetUpdateError,
  } = await supabase
    .from("program_videos")
    .update({
      position:
        currentPosition,
    })
    .eq(
      "program_id",
      programId
    )
    .eq(
      "video_id",
      target.video_id
    );

  if (
    targetUpdateError
  ) {
    redirectWithProgramError(
      targetUpdateError.message
    );
  }

  await normalizeProgramPositions(
    supabase,
    programId
  );
}

/* =========================================================
   NORMALISE PROGRAM VIDEO POSITIONS
========================================================= */

async function normalizeProgramPositions(
  supabase,
  programId
) {
  const {
    data: rows,
    error,
  } = await supabase
    .from("program_videos")
    .select(
      `
      video_id,
      position,
      created_at
      `
    )
    .eq(
      "program_id",
      programId
    )
    .order(
      "position",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    redirectWithProgramError(
      error.message
    );
  }

  for (
    let index = 0;
    index <
    (rows || []).length;
    index += 1
  ) {
    const row =
      rows[index];

    const correctPosition =
      index + 1;

    if (
      row.position ===
      correctPosition
    ) {
      continue;
    }

    const {
      error:
        updateError,
    } = await supabase
      .from(
        "program_videos"
      )
      .update({
        position:
          correctPosition,
      })
      .eq(
        "program_id",
        programId
      )
      .eq(
        "video_id",
        row.video_id
      );

    if (updateError) {
      redirectWithProgramError(
        updateError.message
      );
    }
  }
}