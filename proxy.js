import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseUrl } from "@/lib/supabase/url";

const PROTECTED_PATHS = [
  "/dashboard",
  "/library",
  "/mood",
  "/programs",
  "/account",
  "/favourites",
  "/subscription",
  "/set-password",
];
const ADMIN_PATHS = ["/admin"];
const ORGANISATION_PATHS = ["/organisation-dashboard"];

// Every response proxy.js returns touches the session (it reads/refreshes
// the auth cookie on every request), so none of them may be cached by
// Vercel's edge/CDN layer -- see the Cache-Control note in
// @supabase/ssr's own CookieMethodsServer.setAll docs.
function withNoStore(response) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Plain pathname.startsWith(path) would also match unrelated sibling
// routes that happen to share a prefix (e.g. "/admin".startsWith would
// wrongly gate "/admin-login" or a future "/administration" page behind
// the admin role check). Require an exact match or a "/" boundary.
function matchesPath(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      // @supabase/ssr's own docs warn that behind a CDN/reverse proxy
      // (Vercel Edge included) the auth API call this makes can get cached,
      // silently serving one visitor's "no session" (or another user's
      // session) result to everyone else. `no-store` keeps every auth
      // check live.
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );

  // Refresh the auth session. Required for Server Components to read a
  // valid session, since they cannot write cookies themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPasswordChangeRoute = matchesPath(pathname, "/set-password");

  // The auth refresh may have rotated cookies. Redirect responses must carry
  // those cookies too, otherwise the browser keeps the expired session.
  function redirectWithSession(destination) {
    const response = NextResponse.redirect(destination);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return withNoStore(response);
  }

  if (
    user?.app_metadata?.must_change_password === true &&
    !isPasswordChangeRoute &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/auth/")
  ) {
    return redirectWithSession(new URL("/set-password", request.url));
  }

  if (user && isPasswordChangeRoute && user.app_metadata?.must_change_password !== true) {
    return redirectWithSession(new URL("/post-login", request.url));
  }

  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    matchesPath(pathname, path)
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return redirectWithSession(redirectUrl);
  }

  const isAdminRoute = ADMIN_PATHS.some((path) => matchesPath(pathname, path));
  const isOrganisationRoute = ORGANISATION_PATHS.some((path) =>
    matchesPath(pathname, path)
  );

  if (isAdminRoute || isOrganisationRoute) {
    let role = null;

    if (user) {
      const { data: roleRecord } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      role = roleRecord?.role ?? null;
    }

    if (isAdminRoute && role !== "admin") {
      return redirectWithSession(new URL("/", request.url));
    }

    if (isOrganisationRoute && role !== "organisation") {
      return redirectWithSession(new URL("/", request.url));
    }
  }

  return withNoStore(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
