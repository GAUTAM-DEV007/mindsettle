import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDashboardForRole } from "@/lib/auth/roles";

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

    // Send the user to the correct dashboard.
    redirect(getDashboardForRole(roleRecord.role));
}