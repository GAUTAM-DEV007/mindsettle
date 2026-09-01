// Only local destinations may be accepted from query parameters. Backslashes
// are URL separators in browsers, so a startsWith('/') check is not enough.
export function getSafeRedirectPath(value, fallback = "/post-login") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.length > 2048 ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback;
  }

  const base = "https://mindsettle.invalid";
  try {
    const destination = new URL(value, base);
    return destination.origin === base && !destination.pathname.startsWith("//")
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
