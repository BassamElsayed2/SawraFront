/**
 * Backend base URL (without /api) - used to load images from backend uploads folder
 */
function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "").trim();
  return base || (typeof window !== "undefined" ? "" : "http://localhost:5000");
}

/** Supabase storage host - we never load images from it */
const SUPABASE_STORAGE_REGEX =
  /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

/**
 * Returns the full image URL. Images are always loaded from the current backend
 * (never from Supabase). Supabase URLs are rewritten to backend /uploads/.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  const base = getBackendBaseUrl();

  // Never use Supabase: rewrite to backend /uploads/ or placeholder
  if (SUPABASE_STORAGE_REGEX.test(url)) {
    const m = url.match(
      /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (m && base) return `${base}/uploads/${m[1]}/${m[2]}`;
    return "/placeholder.svg";
  }

  // Rewrite any full URL containing /uploads/ to use current backend base
  const uploadsMatch = url.match(/^(https?:\/\/[^/]+)(\/uploads\/.*)$/);
  if (uploadsMatch) {
    return base ? `${base}${uploadsMatch[2]}` : url;
  }

  // Relative path
  if (url.startsWith("/")) {
    if (!base) return url;
    const path = url.startsWith("/uploads/") ? url : `/uploads${url}`;
    return `${base}${path}`;
  }
  if (!url.startsWith("http")) {
    if (!base) return url;
    return `${base}/uploads/${url.replace(/^\/+/, "")}`;
  }

  return url;
}
