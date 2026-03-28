const LOCALES = ["ar", "en"] as const;

function parseSafeInternalPath(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }

  if (!decoded.startsWith("/") || decoded.includes("//") || decoded.includes("..")) {
    return null;
  }

  const firstSegment = decoded.split("/").filter(Boolean)[0];
  if (!firstSegment || !LOCALES.includes(firstSegment as (typeof LOCALES)[number])) {
    return null;
  }

  return decoded;
}

/**
 * Returns a safe in-app path, or null if missing/invalid (open-redirect safe).
 */
export function trySafeAuthRedirectPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  return parseSafeInternalPath(raw);
}

/**
 * Returns a safe in-app path for post-login redirect.
 * Rejects external URLs and suspicious values to avoid open redirects.
 */
export function getSafeAuthRedirectPath(
  raw: string | null | undefined,
  fallback: string
): string {
  return trySafeAuthRedirectPath(raw) ?? fallback;
}
