/**
 * Backend base URL (without /api) - used to load images from backend uploads folder
 */
function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "").trim();
  return base || (typeof window !== "undefined" ? "" : "http://localhost:5000");
}

/** Logo shown when a product has no image or the file fails to load */
export const FALLBACK_LOGO = "/LogoElSawra.png";

/** Supabase storage host - we never load images from it */
const SUPABASE_STORAGE_REGEX =
  /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

function toBackendUploadsPath(path: string): string {
  const base = getBackendBaseUrl();
  const normalized = path.replace(/\/+uploads\//, "/uploads/");
  return base ? `${base}${normalized}` : normalized;
}

/**
 * Returns the full image URL. Images are always loaded from the current backend
 * (never from Supabase). Supabase URLs are rewritten to backend /uploads/.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return FALLBACK_LOGO;

  const trimmed = url.trim();
  const base = getBackendBaseUrl();

  // Never use Supabase: rewrite to backend /uploads/
  if (SUPABASE_STORAGE_REGEX.test(trimmed)) {
    const m = trimmed.match(
      /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (m) return toBackendUploadsPath(`/uploads/${m[1]}/${m[2]}`);
    return FALLBACK_LOGO;
  }

  // Any absolute URL containing /uploads/ → current backend (handles //uploads and old hosts)
  const uploadsPathMatch = trimmed.match(/\/+uploads\/(.+)$/);
  if (uploadsPathMatch) {
    return toBackendUploadsPath(`/uploads/${uploadsPathMatch[1]}`);
  }

  // Relative path
  if (trimmed.startsWith("/")) {
    if (!base) return trimmed;
    const path = trimmed.startsWith("/uploads/") ? trimmed : `/uploads${trimmed}`;
    return `${base}${path}`;
  }
  if (!trimmed.startsWith("http")) {
    if (!base) return trimmed;
    return `${base}/uploads/${trimmed.replace(/^\/+/, "")}`;
  }

  return FALLBACK_LOGO;
}
