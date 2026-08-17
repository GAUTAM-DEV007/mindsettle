import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./url";

// Server-only. Uses the service role key to bypass RLS -- this is what
// lets /admin see every user's rows instead of just its own. Never import
// this from a Client Component or send the key to the browser.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase dashboard -> Settings -> API) to use admin features."
    );
  }

  return createSupabaseClient(getSupabaseUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isAdminApiConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// auth.admin.listUsers() is paginated; walk every page so callers get the
// full user list in one call.
export async function listAllAuthUsers(adminClient) {
  const perPage = 1000;
  let page = 1;
  const users = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}
