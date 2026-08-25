import "server-only";

import {
  isMegaArchiveConfigured,
  uploadBufferToMega,
} from "@/lib/storage/archive/mega";

import { createClient } from "@/lib/supabase/server";

function filenameFromStoragePath(
  storagePath
) {
  const parts =
    String(storagePath)
      .split("/")
      .filter(Boolean);

  return (
    parts.at(-1) ||
    `media-${Date.now()}`
  );
}

export async function archiveMediaToMega({
  mediaId,
  storagePath,
}) {
  if (
    !mediaId ||
    !storagePath
  ) {
    throw new Error(
      "Media ID and storage path are required."
    );
  }

  const supabase =
    await createClient();

  if (
    !isMegaArchiveConfigured()
  ) {
    return {
      skipped: true,
      reason:
        "MEGA is not configured.",
    };
  }

  await supabase
    .from("videos")
    .update({
      archive_provider:
        "mega",

      archive_status:
        "pending",

      archive_error:
        null,
    })
    .eq(
      "id",
      mediaId
    );

  try {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from("videos")
        .download(
          storagePath
        );

    if (error) {
      throw new Error(
        `Could not download Supabase media for archive: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Supabase returned no media data for archive."
      );
    }

    const arrayBuffer =
      await data.arrayBuffer();

    const buffer =
      Buffer.from(
        arrayBuffer
      );

    const archive =
      await uploadBufferToMega({
        buffer,

        filename:
          filenameFromStoragePath(
            storagePath
          ),
      });

    const {
      error:
        updateError,
    } =
      await supabase
        .from("videos")
        .update({
          archive_provider:
            "mega",

          archive_status:
            "archived",

          archive_path:
            archive.path,

          archive_error:
            null,

          archived_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          mediaId
        );

    if (updateError) {
      throw new Error(
        `Archive succeeded but database status update failed: ${updateError.message}`
      );
    }

    return {
      success: true,
      ...archive,
    };
  } catch (error) {
    console.error(
      `MEGA archive failed for media ${mediaId}:`,
      error
    );

    await supabase
      .from("videos")
      .update({
        archive_provider:
          "mega",

        archive_status:
          "failed",

        archive_error:
          String(
            error?.message ||
            "Unknown MEGA archive error."
          ).slice(
            0,
            1000
          ),
      })
      .eq(
        "id",
        mediaId
      );

    return {
      success: false,
      error:
        error?.message ||
        "MEGA archive failed.",
    };
  }
}
