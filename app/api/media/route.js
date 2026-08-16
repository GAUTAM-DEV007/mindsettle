import {
  createMediaRecord,
  deleteMedia,
  getMedia,
  uploadMedia,
} from "@/lib/media/media-service";
import { getApiRoleContext, roleErrorResponse } from "@/lib/auth/api-role";

const MAX_LEGACY_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg",
  "image/jpeg", "image/png", "image/webp", "image/avif",
]);

export async function GET() {
  try {
    const auth = await getApiRoleContext("admin");
    if (!auth.allowed) return roleErrorResponse(auth.status);

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
        error: "Failed to load media.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let uploadedPath = null;

  try {
    const auth = await getApiRoleContext("admin");
    if (!auth.allowed) return roleErrorResponse(auth.status);

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_LEGACY_UPLOAD_BYTES) {
      return Response.json({ success: false, error: "This upload is too large for the standard uploader. Use the resumable admin uploader." }, { status: 413 });
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

    if (file.size <= 0 || file.size > MAX_LEGACY_UPLOAD_BYTES) {
      return Response.json({ success: false, error: "The media file must be between 1 byte and 100 MB." }, { status: 400 });
    }

    if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
      return Response.json({ success: false, error: "Unsupported media type." }, { status: 400 });
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
          ? title.trim().slice(0, 160)
          : fallbackTitle,
      description:
        typeof description === "string" ? description.trim().slice(0, 4000) : "",
      instructor:
        typeof instructor === "string" && instructor.trim()
          ? instructor.trim().slice(0, 120)
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
        error: "Media upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
