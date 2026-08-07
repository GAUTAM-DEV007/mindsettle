import { createBrowserClient } from "@supabase/ssr";

// Use the SSR-aware browser client (not plain @supabase/supabase-js).
// It writes the session to cookies instead of localStorage, which is what
// lets proxy.js and Server Components (createClient in lib/supabase/server.js)
// see the same logged-in session on the next request.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
