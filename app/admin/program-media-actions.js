"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

function redirectWithProgramError(
  message
) {
  redirect(
    `/admin?programError=${encodeURIComponent(
      message
    )}`
  );
}

export async function updateMediaPrograms(
  formData
) {
  const supabase =
    await requireAdminClient();

  const videoId =
    formData
      .get("videoId")
      ?.toString();

  const programIds = [
    ...new Set(
      formData
        .getAll("programIds")
        .map((value) =>
          value.toString()
        )
        .filter(Boolean)
    ),
  ];

  if (!videoId) {
    redirectWithProgramError(
      "Media id is required."
    );
  }

  const {
    data: existingRows,
    error: existingError,
  } = await supabase
    .from("program_videos")
    .select(
      `
      program_id,
      video_id,
      position
      `
    )
    .eq("video_id", videoId);

  if (existingError) {
    redirectWithProgramError(
      existingError.message
    );
  }

  const existingProgramIds =
    new Set(
      (existingRows || []).map(
        (row) =>
          row.program_id
      )
    );

  const selectedProgramIds =
    new Set(programIds);

  const programIdsToRemove =
    [
      ...existingProgramIds,
    ].filter(
      (programId) =>
        !selectedProgramIds.has(
          programId
        )
    );

  for (
    const programId of
    programIdsToRemove
  ) {
    const { error } =
      await supabase
        .from(
          "program_videos"
        )
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

    await normalizeProgramPositions(
      supabase,
      programId
    );
  }

  const programIdsToAdd =
    programIds.filter(
      (programId) =>
        !existingProgramIds.has(
          programId
        )
    );

  for (
    const programId of
    programIdsToAdd
  ) {
    const {
      data: lastRow,
      error: lastRowError,
    } = await supabase
      .from(
        "program_videos"
      )
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

    if (lastRowError) {
      redirectWithProgramError(
        lastRowError.message
      );
    }

    const nextPosition =
      (
        lastRow?.position ||
        0
      ) + 1;

    const { error } =
      await supabase
        .from(
          "program_videos"
        )
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
  }

  revalidatePath("/admin");
  revalidatePath("/programs");
  revalidatePath("/dashboard");
  revalidatePath("/library");
}

async function normalizeProgramPositions(
  supabase,
  programId
) {
  const {
    data: rows,
    error,
  } = await supabase
    .from(
      "program_videos"
    )
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