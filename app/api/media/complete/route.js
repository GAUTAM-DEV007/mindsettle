import {
  createMediaRecord,
  deleteMedia,
} from "@/lib/media/media-service";

import { getApiRoleContext, roleErrorResponse } from "@/lib/auth/api-role";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_PATH_RE = /^[a-z0-9][a-z0-9._/-]{0,500}$/i;
const ALLOWED_MEDIA_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "image/jpeg", "image/png", "image/webp", "image/avif"]);

function validStoragePath(path, prefix) {
  return typeof path === "string" && path.startsWith(`${prefix}/`) && STORAGE_PATH_RE.test(path) && !path.includes("..") && !path.includes("//");
}

export async function POST(request) {
  try {
    const auth = await getApiRoleContext("admin");
    if (!auth.allowed) return roleErrorResponse(auth.status);

    const body =
      await request.json();

    const {
      title,
      description,
      instructor,
      storagePath,
      thumbnailPath,
      contentType,

      categoryId,
      moodIds = [],

      isFeatured = false,
      showOnHomepage = false,
      isPublished = true,
      isPremium = true,

      durationSeconds = 0,
    } = body;

    const safeBoolean = (value, fallback) =>
      typeof value === "boolean" ? value : fallback;

    if (!validStoragePath(storagePath, "uploads")) {
      return Response.json(
        {
          success: false,
          error:
            "A valid uploaded media path is required.",
        },
        { status: 400 }
      );
    }

    if (thumbnailPath && !validStoragePath(thumbnailPath, "thumbnails")) {
      return Response.json({ success: false, error: "The thumbnail path is invalid." }, { status: 400 });
    }

    if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
      return Response.json({ success: false, error: "Unsupported media type." }, { status: 400 });
    }

    const safeTitle = typeof title === "string" ? title.trim().slice(0, 160) : "";
    const safeDescription = typeof description === "string" ? description.trim().slice(0, 4000) : "";
    const safeInstructor = typeof instructor === "string" ? instructor.trim().slice(0, 120) : "";
    const safeCategoryId = categoryId && UUID_RE.test(String(categoryId)) ? String(categoryId) : null;
    const safeMoodIds = Array.isArray(moodIds) ? [...new Set(moodIds.map(String).filter((id) => UUID_RE.test(id)))].slice(0, 50) : [];

    if (!safeTitle) return Response.json({ success: false, error: "A media title is required." }, { status: 400 });

    try {
      const media =
        await createMediaRecord({
          title: safeTitle,
          description: safeDescription,
          instructor: safeInstructor,

          storagePath,

          thumbnailPath:
            thumbnailPath ||
            null,

          contentType,

          categoryId: safeCategoryId,

          moodIds: safeMoodIds,

          isFeatured:
            safeBoolean(isFeatured, false),

          showOnHomepage:
            safeBoolean(showOnHomepage, false),

          isPublished:
            safeBoolean(isPublished, true),

          isPremium:
            safeBoolean(isPremium, true),

          durationSeconds:
            Number.isFinite(
              Number(durationSeconds)
            )
              ? Math.max(
                  0,
                  Math.round(
                    Number(durationSeconds)
                  )
                )
              : 0,
        });

      return Response.json({
        success: true,
        data: media,
      });
    } catch (dbError) {
      /*
       * Remove the uploaded media file
       * if the database record cannot
       * be created.
       */
      try {
        await deleteMedia({
          path: storagePath,
        });
      } catch (
        mediaDeleteError
      ) {
        console.error(
          "Could not roll back uploaded media:",
          mediaDeleteError
        );
      }

      /*
       * If a thumbnail was uploaded,
       * remove it too.
       */
      if (thumbnailPath) {
        try {
          await deleteMedia({
            path:
              thumbnailPath,
          });
        } catch (
          thumbnailDeleteError
        ) {
          console.error(
            "Could not roll back thumbnail:",
            thumbnailDeleteError
          );
        }
      }

      throw dbError;
    }
  } catch (error) {
    console.error(
      "POST /api/media/complete error:",
      error
    );

    return Response.json(
      {
        success: false,

        error: "Failed to save media. Please try again.",
      },
      { status: 500 }
    );
  }
}
