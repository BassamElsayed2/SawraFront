/**
 * Backend base URL (without /api) - used to load images from backend uploads folder
 */
function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "").trim();
  return base || (typeof window !== "undefined" ? "" : "http://localhost:5000");
}

/**
 * Returns the full image URL so the frontend always loads images from the current backend.
 * Rewrites stored URLs (e.g. https://api.elsawa.net/uploads/...) to use
 * NEXT_PUBLIC_API_URL base so images work in dev and when domain changes.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Rewrite any full URL containing /uploads/ to use current backend base
  const uploadsMatch = url.match(/^(https?:\/\/[^/]+)(\/uploads\/.*)$/);
  if (uploadsMatch) {
    const base = getBackendBaseUrl();
    return `${base}${uploadsMatch[2]}`;
  }

  // Relative path
  if (url.startsWith("/")) {
    const base = getBackendBaseUrl();
    if (!base) return url;
    return `${base}${url}`;
  }
  if (!url.startsWith("http")) {
    const base = getBackendBaseUrl();
    if (!base) return url;
    return `${base}/${url}`;
  }

  return url;
}
