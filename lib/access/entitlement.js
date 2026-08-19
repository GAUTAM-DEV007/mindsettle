// Server-side content entitlement.
//
// Rule of thumb: never generate a signed video URL before calling
// resolveVideoAccess() and checking `allowed`. The actual security
// boundary is the storage RLS policy (see
// supabase/migrations/20260818000000_plans_and_entitlements.sql), which
// enforces the same tier check independently -- this module exists so the
// app doesn't even attempt (and doesn't need to attempt) a signed URL for
// content the viewer can't unlock, and so the free-video counter is
// applied consistently everywhere a video can be opened.

export const FREE_VIEW_LIMIT = 3;

// Mirrors the `public.user_has_active_entitlement` Postgres function so
// callers get one answer whether they ask the DB or ask this module -- the
// RPC is still the source of truth (security definer, checks auth.uid()
// server-side); this just wraps it.
export async function hasActiveEntitlement(supabase, requiredTier) {
  if (!requiredTier || requiredTier <= 0) {
    return true;
  }

  const { data, error } = await supabase.rpc("user_has_active_entitlement", {
    required_tier: requiredTier,
  });

  if (error) {
    console.error("Entitlement check failed:", error);
    return false;
  }

  return Boolean(data);
}

async function hasWatchHistoryRow(supabase, userId, videoId) {
  const { data } = await supabase
    .from("watch_history")
    .select("video_id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();

  return Boolean(data);
}

async function countDistinctFreeViews(supabase, userId) {
  const { data, error } = await supabase
    .from("watch_history")
    .select("video_id, videos!inner(min_tier)")
    .eq("user_id", userId)
    .eq("videos.min_tier", 0);

  if (error) {
    console.error("Free-view count failed:", error);
    return 0;
  }

  return data?.length ?? 0;
}

// Marks a free video as "used" against the 3-video allowance. Safe to call
// even if the row already exists (won't reset progress on an existing
// row) -- upsert with ignoreDuplicates so a repeat visit is a no-op.
async function recordFreeView(supabase, userId, videoId) {
  const { error } = await supabase.from("watch_history").upsert(
    { user_id: userId, video_id: videoId },
    { onConflict: "user_id,video_id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("Could not record free view:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
  }
}

/**
 * Decide whether `video` can be played by `user` right now.
 *
 * @param {object} supabase - request-scoped Supabase server client
 * @param {object|null} user - the signed-in user, or null
 * @param {{ id: string, min_tier: number }} video
 * @param {{ recordView?: boolean }} [options] - pass recordView: true only
 *   at the point playback actually starts (not on every catalogue render),
 *   so browsing a list doesn't burn through the free allowance.
 */
export async function resolveVideoAccess(
  supabase,
  user,
  video,
  options = {}
) {
  if (!user) {
    return {
      allowed: false,
      requiresLogin: true,
      requiresUpgrade: false,
      freeViewsRemaining: null,
    };
  }

  const { data: roleRecord } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

  // Admins always have complete media access.
  if (roleRecord?.role === "admin") {
    return {
      allowed: true,
      requiresLogin: false,
      requiresUpgrade: false,
      freeViewsRemaining: null,
    };
  }

  const minTier =
    video.min_tier ??
    (video.is_premium ? 1 : 0);

  // Free media is fully available to every signed-in user.
  // There is no free-video viewing limit.
  if (minTier <= 0) {
    return {
      allowed: true,
      requiresLogin: false,
      requiresUpgrade: false,
      freeViewsRemaining: null,
    };
  }

  // Premium media is checked only when the user actually opens it.
  const entitled =
    await hasActiveEntitlement(
      supabase,
      minTier
    );

  return {
    allowed: entitled,
    requiresLogin: false,
    requiresUpgrade: !entitled,
    freeViewsRemaining: null,
  };
}

// Summary for dashboard widgets: current plan (if any) and, for unpaid
// users, how many of the 3 free videos are left.
export async function getMembershipSummary(
  supabase,
  user
) {
  if (!user) {
    return {
      isPaid: false,
      plan: null,
      freeViewsRemaining: null,
    };
  }

  const { data: subscription } =
    await supabase
      .from("subscriptions")
      .select(
        "status, plans:subscription_plans(name, type, tier)"
      )
      .eq("user_id", user.id)
      .in(
        "status",
        ["active", "trialing"]
      )
      .maybeSingle();

  if (subscription) {
    return {
      isPaid: true,
      plan:
        subscription.plans ??
        null,
      freeViewsRemaining: null,
    };
  }

  return {
    isPaid: false,
    plan: null,
    freeViewsRemaining: null,
  };
}

// For catalogue pages (dashboard/library/mood/programs): batch-resolve
// access for a list of videos without recording any free views (browsing
// the catalogue shouldn't consume the allowance -- only opening a video
// should). Returns a Map<videoId, { allowed, requiresUpgrade }>.
export async function resolveCatalogueAccess(supabase, user, videos) {
  const results = new Map();

  if (!user) {
    for (const video of videos) {
      results.set(video.id, { allowed: false, requiresUpgrade: false, requiresLogin: true });
    }
    return results;
  }

  const hasAnyPlan = await hasActiveEntitlement(supabase, 1);

  // Tiers actually present among premium videos in this batch, so we only
  // do the extra RPC calls organisation multi-tier content actually needs.
  const premiumTiers = [
    ...new Set(
      videos
        .map((v) => v.min_tier ?? (v.is_premium ? 1 : 0))
        .filter((tier) => tier > 1)
    ),
  ];

  const tierEntitlement = new Map();
  for (const tier of premiumTiers) {
    tierEntitlement.set(tier, hasAnyPlan ? await hasActiveEntitlement(supabase, tier) : false);
  }

  let freeUsed = null;

  for (const video of videos) {
    const minTier = video.min_tier ?? (video.is_premium ? 1 : 0);

    if (minTier > 0) {
      const entitled = minTier === 1 ? hasAnyPlan : tierEntitlement.get(minTier) ?? false;
      results.set(video.id, { allowed: entitled, requiresUpgrade: !entitled, requiresLogin: false });
      continue;
    }

    if (hasAnyPlan) {
      results.set(video.id, { allowed: true, requiresUpgrade: false, requiresLogin: false });
      continue;
    }

    if (freeUsed === null) {
      freeUsed = await countDistinctFreeViews(supabase, user.id);
    }

    results.set(video.id, { allowed: true, requiresUpgrade: false, requiresLogin: false });
  }

  return results;
}
