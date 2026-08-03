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
        contentType,
      });

      return Response.json({
        success: true,
        data: media,
      });
    } catch (dbError) {
      await deleteMedia({
        path: storagePath,
      });

      throw dbError;
    }
  } catch (error) {
    console.error("POST /api/media/complete error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to save media.",
      },
      { status: 500 }
    );
  }
}