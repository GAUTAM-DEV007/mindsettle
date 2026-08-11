import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - safe to ignore because
            // proxy.js already refreshes the session on every request.
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
