import "server-only";

function normaliseConfiguredUrl(value) {
  if (!value) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const parsed = new URL(candidate);
  const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

  if (process.env.NODE_ENV === "production" && isLocal) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use the deployed site URL in production.");
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
  }

  if (!isLocal && parsed.protocol !== "https:") {
    throw new Error("The configured site URL must use HTTPS.");
  }

  return parsed.origin;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    null;

  if (!configuredUrl) {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3000";
    }

    throw new Error("NEXT_PUBLIC_SITE_URL is not configured for production.");
  }

  return normaliseConfiguredUrl(configuredUrl);
}

export function getSitePageUrl(pathname) {
  return new URL(pathname, getSiteUrl()).toString();
}
