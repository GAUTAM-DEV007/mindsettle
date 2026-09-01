import { createClient } from "@/lib/supabase/server";
import { resolveVideoAccess } from "@/lib/access/entitlement";

const PREVIEW_URL_TTL_SECONDS = 300;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request,
  { params }
) {
  try {
    const {
      videoId,
    } = await params;

    if (!UUID_RE.test(videoId || "")) {
      return Response.json(
        {
          success: false,
          error: "A valid video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          requiresLogin: true,
        },
        {
          status: 401,
        }
      );
    }

    if (user.app_metadata?.must_change_password === true) {
      return Response.json(
        {
          success: false,
          requiresPasswordChange: true,
          error: "Choose a private password before playing media.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: video,
      error: videoError,
    } =
      await supabase
        .from("videos")
        .select(
          `
          id,
          video_url,
          min_tier,
          is_premium,
          is_published
          `
        )
        .eq(
          "id",
          videoId
        )
        .maybeSingle();

    if (
      videoError ||
      !video ||
      !video.is_published
    ) {
      return Response.json(
        {
          success: false,
          error: "Video not found.",
        },
        {
          status: 404,
        }
      );
    }

    const access =
      await resolveVideoAccess(
        supabase,
        user,
        video,
        {
          // Browsing must not consume free views. Only previously claimed
          // free videos (or entitled paid videos) may supply a hover preview.
          recordView: false,
          allowUnclaimedFree: false,
        }
      );

    if (!access.allowed) {
      return Response.json(
        {
          success: false,
          requiresUpgrade:
            access.requiresUpgrade,
          requiresLogin:
            access.requiresLogin,
        },
        {
          status:
            access.requiresLogin
              ? 401
              : 403,
        }
      );
    }

    if (!video.video_url) {
      return Response.json(
        {
          success: false,
          error: "Video file is unavailable.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: signedData,
      error: signedError,
    } =
      await supabase.storage
        .from("videos")
        .createSignedUrl(
          video.video_url,
          PREVIEW_URL_TTL_SECONDS
        );

    if (
      signedError ||
      !signedData?.signedUrl
    ) {
      console.error(
        "Could not create preview URL:",
        signedError
      );

      return Response.json(
        {
          success: false,
          error: "Preview unavailable.",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      success: true,
      previewUrl:
        signedData.signedUrl,
      expiresIn:
        PREVIEW_URL_TTL_SECONDS,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(
      "GET media preview error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Preview unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}
