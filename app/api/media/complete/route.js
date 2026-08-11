import {
  createMediaRecord,
  deleteMedia,
} from "@/lib/media/media-service";

import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      instructor,
      storagePath,
      thumbnailPath,
      contentType,
    } = body;

    if (!storagePath) {
      return Response.json(
        {
          success: false,
          error: "Storage path is required.",
        },
        { status: 400 }
      );
    }

    try {
      const media = await createMediaRecord({
        title,
        description,
        instructor,
        storagePath,
        thumbnailPath:
          thumbnailPath || null,
        contentType,
      });

      return Response.json({
        success: true,
        data: media,
      });
    } catch (dbError) {
      // Remove the uploaded media file if
      // the database record cannot be created.
      try {
        await deleteMedia({
          path: storagePath,
        });
      } catch (mediaDeleteError) {
        console.error(
          "Could not roll back uploaded media:",
          mediaDeleteError
        );
      }

      // If a thumbnail was also uploaded,
      // remove it during rollback.
      if (thumbnailPath) {
        try {
          await deleteMedia({
            path: thumbnailPath,
          });
        } catch (thumbnailDeleteError) {
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to save media.",
      },
      { status: 500 }
    );
  }
}