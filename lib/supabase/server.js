import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrl } from "./url";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Safe to ignore when called from a Server Component.
            // The proxy refreshes the session.
          }
        },
      },
      // Next.js caches plain fetch() calls by default; without this, the
      // auth API call inside getUser()/getSession() can get memoized and
      // reused across unrelated requests on a warm serverless instance,
      // silently serving a stale "no session" result. See the
      // Cache-Control note in @supabase/ssr's CookieMethodsServer docs.
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}