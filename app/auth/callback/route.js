import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getSiteUrl } from "@/lib/auth/site-url";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const siteUrl = getSiteUrl();

  const code = searchParams.get("code");

  const requestedRedirect = searchParams.get("redirectTo");
  const redirectTo = getSafeRedirectPath(requestedRedirect);

  if (code) {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth
        .exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, siteUrl));
    }
  }

  const providerError = searchParams.get("error") || searchParams.get("error_code");
  const errorCode = providerError === "access_denied" ? "oauth-cancelled" : "auth-code-error";
  return NextResponse.redirect(new URL(`/login?error=${errorCode}`, siteUrl));
}
