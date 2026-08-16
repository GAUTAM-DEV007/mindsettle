import { createClient } from "@/lib/supabase/server";

export async function getApiRoleContext(expectedRole) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return { supabase, user: null, allowed: false, status: 401 };

  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError || roleRecord?.role !== expectedRole) {
    return { supabase, user, allowed: false, status: 403 };
  }

  return { supabase, user, allowed: true, status: 200 };
}

export function roleErrorResponse(status) {
  return Response.json(
    { success: false, error: status === 401 ? "Authentication required." : "You do not have permission to perform this action." },
    { status }
  );
}
