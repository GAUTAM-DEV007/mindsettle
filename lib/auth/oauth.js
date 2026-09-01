import { getSafeRedirectPath } from "./redirects.js";

export function getOAuthCallbackUrl(origin, redirectTo = "/post-login") {
  const appOrigin = new URL(origin);
  if (appOrigin.protocol !== "http:" && appOrigin.protocol !== "https:") {
    throw new TypeError("OAuth callbacks require an HTTP or HTTPS origin.");
  }

  const callbackUrl = new URL("/auth/callback", appOrigin.origin);
  callbackUrl.searchParams.set("redirectTo", getSafeRedirectPath(redirectTo));
  return callbackUrl.toString();
}
