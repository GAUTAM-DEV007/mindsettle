import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  isAdminApiConfigured,
  createAdminClient,
  listAllAuthUsers,
} from "@/lib/supabase/admin";
import { getMedia } from "@/lib/media/media-service";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}) {
  const {
    categoryError,
    mediaError,
    programError,
    socialError,
    usersError,
    subscriptionsError,
    invoicesError,
    planError,
  } = await searchParams;

  const supabase = await createClient();

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  // --------------------------------------------------
  // ADMIN ROLE CHECK
  // --------------------------------------------------

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    roleError ||
    roleRecord?.role !== "admin"
  ) {
    redirect("/");
  }

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  const [
    {
      data: stats,
      error: statsError,
    },

    {
      data: categories,
      error: categoriesError,
    },

    {
      data: moods,
      error: moodsError,
    },

    {
      data: videoMoodRows,
      error: videoMoodsError,
    },

    {
      data: programs,
      error: programsError,
    },

    {
      data: programVideoRows,
      error: programVideosError,
    },

    {
      data: socialLinks,
      error: socialLinksError,
    },

    mediaResult,

    plansResult,
  ] = await Promise.all([
    supabase.rpc(
      "admin_dashboard_analytics"
    ),

    supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug
        `
      )
      .order("name"),

    supabase
      .from("moods")
      .select(
        `
        id,
        name,
        slug,
        emoji,
        description
        `
      )
      .order("name"),

    supabase
      .from("video_moods")
      .select(
        `
        video_id,
        mood_id
        `
      ),

    supabase
      .from("programs")
      .select(
        `
        id,
        title,
        slug,
        description,
        thumbnail_url,
        is_published,
        created_at,
        updated_at
        `
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      ),

    supabase
      .from("program_videos")
      .select(
        `
        program_id,
        video_id,
        position,
        created_at
        `
      )
      .order(
        "position",
        {
          ascending: true,
        }
      ),

    supabase
      .from("social_links")
      .select(
        `
        id,
        platform,
        url,
        is_enabled,
        sort_order,
        created_at,
        updated_at
        `
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      ),

    getMedia(),

    supabase
      .from("plans")
      .select(
        `
        id,
        type,
        name,
        slug,
        description,
        price_cents,
        currency,
        billing_cycle,
        stripe_price_id,
        seat_limit,
        tier,
        is_active,
        sort_order
        `
      )
      .order("sort_order", { ascending: true }),
  ]);

  const plans = plansResult?.data || [];

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  if (statsError) {
    console.error(
      "Admin analytics error:",
      statsError
    );

    throw new Error(
      statsError.message
    );
  }

  if (categoriesError) {
    console.error(
      "Admin categories error:",
      categoriesError
    );

    throw new Error(
      categoriesError.message
    );
  }

  if (moodsError) {
    console.error(
      "Admin moods error:",
      moodsError
    );

    throw new Error(
      moodsError.message
    );
  }

  if (videoMoodsError) {
    console.error(
      "Admin video moods error:",
      videoMoodsError
    );

    throw new Error(
      videoMoodsError.message
    );
  }

  if (programsError) {
    console.error(
      "Admin programs error:",
      programsError
    );

    throw new Error(
      programsError.message
    );
  }

  if (programVideosError) {
    console.error(
      "Admin program videos error:",
      programVideosError
    );

    throw new Error(
      programVideosError.message
    );
  }

  if (socialLinksError) {
    console.error(
      "Admin social links error:",
      socialLinksError
    );

    throw new Error(
      socialLinksError.message
    );
  }

  // --------------------------------------------------
  // NORMALISE MEDIA
  // --------------------------------------------------

  const media =
    Array.isArray(mediaResult)
      ? mediaResult
      : [];

  // --------------------------------------------------
  // MOOD RELATIONSHIPS
  // --------------------------------------------------

  const moodMap =
    new Map();

  for (
    const row of
    videoMoodRows || []
  ) {
    if (
      !moodMap.has(
        row.video_id
      )
    ) {
      moodMap.set(
        row.video_id,
        []
      );
    }

    moodMap
      .get(row.video_id)
      .push(row.mood_id);
  }

  // --------------------------------------------------
  // PROGRAM RELATIONSHIPS
  // --------------------------------------------------

  const programMap =
    new Map();

  for (
    const row of
    programVideoRows || []
  ) {
    if (
      !programMap.has(
        row.video_id
      )
    ) {
      programMap.set(
        row.video_id,
        []
      );
    }

    programMap
      .get(row.video_id)
      .push(row.program_id);
  }

  // --------------------------------------------------
  // MEDIA WITH MOODS + PROGRAMS
  // --------------------------------------------------

  const mediaWithRelations =
    media.map((item) => ({
      ...item,

      mood_ids:
        moodMap.get(
          item.id
        ) || [],

      program_ids:
        programMap.get(
          item.id
        ) || [],
    }));

  // --------------------------------------------------
  // PROGRAMS WITH ORDERED VIDEOS
  // --------------------------------------------------

  const programsWithVideos =
    (programs || []).map(
      (program) => {
        const videos =
          (
            programVideoRows || []
          )
            .filter(
              (row) =>
                row.program_id ===
                program.id
            )
            .sort(
              (a, b) =>
                a.position -
                b.position
            )
            .map((row) => {
              const video =
                mediaWithRelations.find(
                  (item) =>
                    item.id ===
                    row.video_id
                );

              if (!video) {
                return null;
              }

              return {
                ...video,
                position:
                  row.position,
              };
            })
            .filter(Boolean);

        return {
          ...program,
          videos,
        };
      }
    );

  // --------------------------------------------------
  // LOAD USERS / SUBSCRIPTIONS / INVOICES (service role)
  // --------------------------------------------------
  // Needs SUPABASE_SERVICE_ROLE_KEY to bypass RLS (list every user's rows,
  // not just the admin's own) and to call the Admin API. Guarded so a
  // missing key shows an empty state instead of crashing this page.

  const adminApiConfigured = isAdminApiConfigured();
  let users = [];
  let subscriptions = [];
  let invoices = [];
  let organisationSeats = [];

  if (adminApiConfigured) {
    try {
      const adminSupabase = createAdminClient();
      const planById = new Map(plans.map((p) => [p.id, p]));

      const [
        authUsers,
        { data: roleRows },
        { data: subscriptionRows },
        { data: invoiceRows },
        { data: orgMemberRows },
      ] = await Promise.all([
        listAllAuthUsers(adminSupabase),
        adminSupabase.from("user_roles").select("user_id, role"),
        adminSupabase
          .from("subscriptions")
          .select(
            "id, user_id, status, plan, plan_id, stripe_subscription_id, current_period_end"
          )
          .order("created_at", { ascending: false }),
        adminSupabase
          .from("invoices")
          .select(
            "id, user_id, amount_due, currency, status, hosted_invoice_url, invoice_pdf, email_sent_at, created_at"
          )
          .order("created_at", { ascending: false }),
        adminSupabase
          .from("organisation_members")
          .select("organisation_id, status"),
      ]);

      const emailByUserId = new Map(authUsers.map((u) => [u.id, u.email]));
      const roleByUserId = new Map(
        (roleRows ?? []).map((r) => [r.user_id, r.role])
      );
      const subscriptionByUserId = new Map(
        (subscriptionRows ?? [])
          .filter((s) => ["active", "trialing"].includes(s.status))
          .map((s) => [s.user_id, s])
      );

      users = authUsers
        .map((u) => ({
          id: u.id,
          email: u.email,
          role: roleByUserId.get(u.id) ?? "user",
          createdAt: u.created_at,
          suspended:
            Boolean(u.banned_until) && new Date(u.banned_until) > new Date(),
          subscriptionStatus: subscriptionByUserId.get(u.id)?.status ?? "none",
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      subscriptions = (subscriptionRows ?? []).map((s) => {
        const plan = s.plan_id ? planById.get(s.plan_id) : null;

        return {
          id: s.id,
          email: emailByUserId.get(s.user_id) ?? "Unknown",
          status: s.status,
          plan: plan?.name ?? s.plan,
          planType: plan?.type ?? (roleByUserId.get(s.user_id) === "organisation" ? "organisation" : "individual"),
          billingCycle: plan?.billing_cycle ?? null,
          stripeSubscriptionId: s.stripe_subscription_id,
          currentPeriodEnd: s.current_period_end,
        };
      });

      invoices = (invoiceRows ?? []).map((i) => ({
        id: i.id,
        email: emailByUserId.get(i.user_id) ?? "Unknown",
        amountDue: i.amount_due,
        currency: i.currency,
        status: i.status,
        hostedInvoiceUrl: i.hosted_invoice_url,
        invoicePdf: i.invoice_pdf,
        emailSentAt: i.email_sent_at,
        createdAt: i.created_at,
      }));

      const seatsUsedByOrgId = new Map();
      for (const row of orgMemberRows ?? []) {
        if (row.status !== "active") continue;
        seatsUsedByOrgId.set(
          row.organisation_id,
          (seatsUsedByOrgId.get(row.organisation_id) ?? 0) + 1
        );
      }

      organisationSeats = authUsers
        .filter((u) => roleByUserId.get(u.id) === "organisation")
        .map((org) => {
          const subscription = subscriptionByUserId.get(org.id) ?? null;
          const plan = subscription?.plan_id ? planById.get(subscription.plan_id) : null;
          const seatLimit = plan?.seat_limit ?? null;
          const seatsUsed = seatsUsedByOrgId.get(org.id) ?? 0;

          return {
            id: org.id,
            email: org.email,
            planName: plan?.name ?? subscription?.plan ?? "No plan",
            seatLimit,
            seatsUsed,
            seatsRemaining: seatLimit !== null ? Math.max(seatLimit - seatsUsed, 0) : null,
            status: subscription?.status ?? "none",
          };
        });
    } catch (err) {
      // e.g. the invoices migration hasn't been run yet -- don't take the
      // whole admin dashboard down over it, just show empty sections.
      console.error("Admin billing data error:", err);
    }
  }

  // --------------------------------------------------
  // RENDER ADMIN DASHBOARD
  // --------------------------------------------------

  return (
    <AdminDashboardClient
      stats={stats}
      categories={
        categories || []
      }
      moods={
        moods || []
      }
      media={
        mediaWithRelations
      }
      programs={
        programsWithVideos
      }
      socialLinks={
        socialLinks || []
      }
      categoryError={
        categoryError || null
      }
      mediaError={
        mediaError || null
      }
      programError={
        programError || null
      }
      socialError={
        socialError || null
      }
      users={users}
      subscriptions={subscriptions}
      invoices={invoices}
      organisationSeats={organisationSeats}
      plans={plans}
      adminApiConfigured={adminApiConfigured}
      usersError={usersError || null}
      subscriptionsError={subscriptionsError || null}
      invoicesError={invoicesError || null}
      planError={planError || null}
    />
  );
}