import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDashboardForRole } from "@/lib/auth/roles";
import {
    DEFAULT_ORGANISATION_SEATS,
    clampOrganisationSeats,
} from "@/lib/billing/organisation-pricing";

// Never statically render/cache this route -- it exists solely to read
// the just-created session and redirect, so the result must always be
// computed fresh per request.
export const dynamic = "force-dynamic";

export default async function PostLoginPage() {
    // Create the server-side Supabase client.
    const supabase = await createClient();

    // Check which user is currently logged in.
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    // No valid login session exists.
    if (userError || !user) {
        redirect("/login");
    }

    if (user.app_metadata?.must_change_password === true) {
        redirect("/set-password");
    }

    // Read this user's role from the user_roles table.
    const { data: roleRecord, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    // The account exists, but no role record was found.
    if (roleError || !roleRecord) {
        console.error("Role was not found:", roleError);
        redirect("/login?error=role-not-found");
    }

    if (roleRecord.role === "organisation") {
        const { data: subscription } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing"])
            .limit(1)
            .maybeSingle();

        if (!subscription) {
            const requestedSeats = clampOrganisationSeats(
                user.user_metadata?.requested_seats ?? DEFAULT_ORGANISATION_SEATS
            );
            redirect(`/subscription?seats=${requestedSeats}`);
        }
    }

    if (roleRecord.role === "user") {
        const { data: organisationMembership } = await supabase
            .from("organisation_members")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

        if (organisationMembership) {
            redirect("/dashboard");
        }
    }

    // Every role lands on its own overview page, subscribed or not --
    // /library, /organisation-dashboard and /dashboard all resolve
    // per-video/per-plan access themselves (locked previews, "no active
    // plan" banners) via lib/access/entitlement.js, and the persistent
    // "Upgrade" nav link plus in-context "View plans" CTAs keep
    // /subscription reachable without gating login on it.
    redirect(getDashboardForRole(roleRecord.role));
}
