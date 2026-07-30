import { getStorageProvider } from "../storage/index";
import { createClient } from "../supabase/server";

/**
 * Get all media records from the videos table.
 *
 * This also creates temporary signed URLs for private
 * thumbnail and video files stored in Supabase Storage.
 */
export async function getMedia() {
  const supabase = await createClient();
  const storageProvider = getStorageProvider();

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading media:", error);
    throw new Error(`Failed to load media: ${error.message}`);
  }

  const mediaWithSignedUrls = await Promise.all(
    (data || []).map(async (item) => {
      let signedThumbnailUrl = null;
      let signedVideoUrl = null;

      if (item.thumbnail_url) {
        try {
          const thumbnailResult =
            await storageProvider.createSignedUrl({
              path: item.thumbnail_url,
              expiresIn: 3600,
            });

          signedThumbnailUrl =
            thumbnailResult?.signedUrl || null;
        } catch (error) {
          console.error(
            `Failed to create thumbnail signed URL for media ${item.id}:`,
            error
          );
        }
      }

      if (item.video_url) {
        try {
          const videoResult =
            await storageProvider.createSignedUrl({
              path: item.video_url,
              expiresIn: 3600,
            });

          signedVideoUrl =
            videoResult?.signedUrl || null;
        } catch (error) {
          console.error(
            `Failed to create video signed URL for media ${item.id}:`,
            error
          );
        }
      }

      return {
        ...item,
        signed_thumbnail_url: signedThumbnailUrl,
        signed_video_url: signedVideoUrl,
      };
    })
  );

  return mediaWithSignedUrls;
}

/**
 * Upload a file to the active storage provider.
 */
export async function uploadMedia({
  file,
  path,
  contentType,
}) {
  if (!file) {
    throw new Error("A media file is required.");
  }

  if (!path) {
    throw new Error("A storage path is required.");
  }

  const storageProvider = getStorageProvider();

  return storageProvider.uploadFile({
    file,
    path,
    contentType,
  });
}

/**
 * Save uploaded media information in the videos table.
 */
export async function createMediaRecord({
  title,
  description,
  instructor,
  storagePath,
  contentType,
}) {
  if (!title || typeof title !== "string") {
    throw new Error("A media title is required.");
  }

  if (!storagePath) {
    throw new Error("A storage path is required.");
  }

  const supabase = await createClient();

  const isImage = contentType?.startsWith("image/");

  const mediaRecord = {
    title: title.trim(),
    description:
      typeof description === "string"
        ? description.trim()
        : "",
    instructor:
      typeof instructor === "string" && instructor.trim()
        ? instructor.trim()
        : "MindSettle",

    // Temporary value until the real admin form
    // supplies the actual video duration.
    duration_minutes: 1,

    thumbnail_url: isImage ? storagePath : null,
    video_url: isImage ? null : storagePath,

    is_premium: false,
  };

  const { data, error } = await supabase
    .from("videos")
    .insert(mediaRecord)
    .select()
    .single();

  if (error) {
    console.error("Error saving media record:", error);
    throw new Error(
      `Failed to save media record: ${error.message}`
    );
  }

  return data;
}

/**
 * Delete a media file from the active storage provider.
 *
 * This is used for rollback if the database insert fails
 * after the file has already been uploaded.
 */
export async function deleteMedia({ path }) {
  if (!path) {
    throw new Error("A storage path is required.");
  }

  const storageProvider = getStorageProvider();

  return storageProvider.deleteFile({
    path,
  });
}