import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDashboardForRole } from "@/lib/auth/roles";

export async function requireRole(expectedRole) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    const { data: roleRecord, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (roleError || !roleRecord) {
        console.error("Unable to read user role:", roleError);
        redirect("/login?error=role-not-found");
    }

    if (roleRecord.role !== expectedRole) {
        redirect(getDashboardForRole(roleRecord.role));
    }

    return {
        user,
        role: roleRecord.role
    };
}
