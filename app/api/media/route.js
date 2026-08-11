import {
  createMediaRecord,
  deleteMedia,
  getMedia,
  uploadMedia,
} from "@/lib/media/media-service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const media = await getMedia();

    return Response.json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    console.error("GET /api/media error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load media.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let uploadedPath = null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        {
          success: false,
          error: "You must be logged in before uploading.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const title = formData.get("title");
    const description = formData.get("description");
    const instructor = formData.get("instructor");

    if (!file || typeof file === "string") {
      return Response.json(
        {
          success: false,
          error: "A media file is required.",
        },
        { status: 400 }
      );
    }

    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-");

    const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}`;
    const storagePath = `uploads/${uniqueFileName}`;

    const uploadResult = await uploadMedia({
      file,
      path: storagePath,
      contentType: file.type,
    });

    uploadedPath = uploadResult.path;

    const fallbackTitle = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ");

    const mediaRecord = await createMediaRecord({
      title:
        typeof title === "string" && title.trim()
          ? title.trim()
          : fallbackTitle,
      description:
        typeof description === "string" ? description.trim() : "",
      instructor:
        typeof instructor === "string" && instructor.trim()
          ? instructor.trim()
          : "MindSettle",
      storagePath: uploadResult.path,
      contentType: file.type,
    });

    return Response.json(
      {
        success: true,
        message: "Media uploaded and saved successfully.",
        data: {
          upload: uploadResult,
          media: mediaRecord,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/media error:", error);

    if (uploadedPath) {
      try {
        await deleteMedia({
          path: uploadedPath,
        });

        console.log(
          "Rollback successful. Deleted uploaded file:",
          uploadedPath
        );
      } catch (cleanupError) {
        console.error(
          "Rollback failed. Uploaded file could not be deleted:",
          cleanupError
        );
      }
    }

    return Response.json(
      {
        success: false,
        error: error.message || "Media upload failed.",
      },
      { status: 500 }
    );
  }
}