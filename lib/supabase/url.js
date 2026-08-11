// NEXT_PUBLIC_SUPABASE_URL should be the bare project URL
// (https://<ref>.supabase.co), but it's easy to accidentally set it to
// one of Supabase's service endpoints instead -- e.g. copy-pasting the
// "Connect to REST API" snippet gives you ".../rest/v1/". When that
// happens, supabase-js's internal URL building (new URL('auth/v1',
// baseUrl)) appends onto the already-wrong path instead of the origin,
// producing garbage like ".../rest/v1/auth/v1/token" and every request
// fails with a PostgREST "Invalid path specified in request URL" error.
// Strip any known service suffix (and trailing slashes) so the app works
// regardless of which form the env var was set to.
const KNOWN_SERVICE_SUFFIXES = [
  "rest/v1",
  "auth/v1",
  "storage/v1",
  "realtime/v1",
  "functions/v1",
];

export function getSupabaseUrl(rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!rawUrl) {
    return rawUrl;
  }

  let url = rawUrl.trim().replace(/\/+$/, "");

  for (const suffix of KNOWN_SERVICE_SUFFIXES) {
    if (url.endsWith(`/${suffix}`)) {
      url = url.slice(0, -(suffix.length + 1));
      break;
    }
  }

  return url;
}
