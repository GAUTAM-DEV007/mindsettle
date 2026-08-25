import { getStorageProvider } from "../storage/index";
import { createClient } from "../supabase/server";

/**
 * Get all media records from the videos table.
 *
 * This also creates temporary signed URLs for private
 * thumbnail and video files using the active storage provider.
 */
export async function getMedia() {
  const supabase = await createClient();
  const storageProvider = getStorageProvider();

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading media:",
      error
    );

    throw new Error(
      `Failed to load media: ${error.message}`
    );
  }

  const mediaWithSignedUrls =
    await Promise.all(
      (data || []).map(
        async (item) => {
          let signedThumbnailUrl =
            null;

          let signedVideoUrl =
            null;

          if (item.thumbnail_url) {
            try {
              const thumbnailResult =
                await storageProvider.createSignedUrl(
                  {
                    path:
                      item.thumbnail_url,

                    expiresIn:
                      3600,
                  }
                );

              signedThumbnailUrl =
                thumbnailResult
                  ?.signedUrl ||
                null;
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
                await storageProvider.createSignedUrl(
                  {
                    path:
                      item.video_url,

                    expiresIn:
                      3600,
                  }
                );

              signedVideoUrl =
                videoResult
                  ?.signedUrl ||
                null;
            } catch (error) {
              console.error(
                `Failed to create video signed URL for media ${item.id}:`,
                error
              );
            }
          }

          return {
            ...item,

            signed_thumbnail_url:
              signedThumbnailUrl,

            signed_video_url:
              signedVideoUrl,
          };
        }
      )
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
    throw new Error(
      "A media file is required."
    );
  }

  if (!path) {
    throw new Error(
      "A storage path is required."
    );
  }

  const storageProvider =
    getStorageProvider();

  return storageProvider.uploadFile({
    file,
    path,
    contentType,
  });
}

/**
 * Save uploaded media information
 * in the videos table.
 *
 * Also creates any selected mood
 * relationships in video_moods.
 */
export async function createMediaRecord({
  title,
  description,
  instructor,
  storagePath,
  thumbnailPath = null,
  contentType,

  categoryId = null,
  moodIds = [],

  isFeatured = false,
  showOnHomepage = false,
  isPublished = true,
  isPremium = true,

  durationSeconds = 0,
  durationMinutes = 1,
}) {
  if (
    !title ||
    typeof title !== "string"
  ) {
    throw new Error(
      "A media title is required."
    );
  }

  if (!storagePath) {
    throw new Error(
      "A storage path is required."
    );
  }

  const supabase =
    await createClient();

  const isImage =
    contentType?.startsWith(
      "image/"
    );

  const safeDurationSeconds =
    Number.isFinite(
      Number(durationSeconds)
    ) &&
    Number(durationSeconds) > 0
      ? Math.round(
          Number(durationSeconds)
        )
      : 0;

  const safeDuration =
    safeDurationSeconds > 0
      ? Math.max(
          1,
          Math.ceil(
            safeDurationSeconds / 60
          )
        )
      : Number.isFinite(
          Number(durationMinutes)
        ) &&
        Number(durationMinutes) > 0
        ? Math.round(
            Number(durationMinutes)
          )
        : 1;

  const mediaRecord = {
    title:
      title.trim(),

    description:
      typeof description ===
      "string"
        ? description.trim()
        : "",

    instructor:
      typeof instructor ===
        "string" &&
      instructor.trim()
        ? instructor.trim()
        : "MindSettle",

    category_id:
      categoryId || null,

    duration_minutes:
      safeDuration,

    duration_seconds:
      safeDurationSeconds > 0
        ? safeDurationSeconds
        : safeDuration * 60,

    /*
     * If a separate thumbnail
     * was uploaded, use it.
     *
     * For a standalone image,
     * the image itself is also
     * used as its thumbnail.
     */
    thumbnail_url:
      thumbnailPath ||
      (isImage
        ? storagePath
        : null),

    /*
     * Video and audio currently
     * use video_url as their main
     * stored media path.
     *
     * Images do not need a
     * playback URL.
     */
    video_url:
      isImage
        ? null
        : storagePath,

    is_premium:
      Boolean(
        isPremium
      ),

    // Keep the legacy premium flag and the M5 tier system in sync.
    // Free = tier 0, Premium = tier 1.
    min_tier:
      isPremium ? 1 : 0,

    is_featured:
      Boolean(
        isFeatured
      ),

    show_on_homepage:
      Boolean(
        showOnHomepage
      ),

    is_published:
      Boolean(
        isPublished
      ),
  };

  const {
    data,
    error,
  } = await supabase
    .from("videos")
    .insert(mediaRecord)
    .select()
    .single();

  if (error) {
    console.error(
      "Error saving media record:",
      error
    );

    throw new Error(
      `Failed to save media record: ${error.message}`
    );
  }

  /*
   * Save selected mood
   * relationships.
   */
  const validMoodIds =
    Array.isArray(moodIds)
      ? [
          ...new Set(
            moodIds
              .map((id) =>
                String(id).trim()
              )
              .filter(Boolean)
          ),
        ]
      : [];

  if (
    validMoodIds.length >
    0
  ) {
    const moodRows =
      validMoodIds.map(
        (moodId) => ({
          video_id:
            data.id,

          mood_id:
            moodId,
        })
      );

    const {
      error:
        moodInsertError,
    } = await supabase
      .from("video_moods")
      .insert(moodRows);

    if (moodInsertError) {
      console.error(
        "Error saving video moods:",
        moodInsertError
      );

      /*
       * Roll back the video
       * database record if mood
       * assignment fails.
       *
       * The route will then clean
       * up the physical uploaded
       * media and thumbnail.
       */
      const {
        error:
          rollbackError,
      } = await supabase
        .from("videos")
        .delete()
        .eq(
          "id",
          data.id
        );

      if (
        rollbackError
      ) {
        console.error(
          "Could not roll back video record after mood assignment failure:",
          rollbackError
        );
      }

      throw new Error(
        `Failed to save mood assignments: ${moodInsertError.message}`
      );
    }
  }

  return {
    ...data,

    mood_ids:
      validMoodIds,
  };
}

/**
 * Delete a media file from
 * the active storage provider.
 *
 * This can be Supabase now,
 * and another provider such as
 * MEGA/Vimeo later.
 */
export async function deleteMedia({
  path,
}) {
  if (!path) {
    throw new Error(
      "A storage path is required."
    );
  }

  const storageProvider =
    getStorageProvider();

  return storageProvider.deleteFile(
    {
      path,
    }
  );
}