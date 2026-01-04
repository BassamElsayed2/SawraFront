import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and special files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".") ||
    pathname.endsWith("/sitemap.xml") ||
    pathname.endsWith("/sitemaps.xml") ||
    pathname.includes("/sitemap") ||
    pathname.endsWith("/robots.txt") ||
    pathname.endsWith("/favicon.ico")
  ) {
    return;
  }

  // Redirect to default locale if missing
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Only handle /profile routes
  if (pathname.includes("/profile")) {
    const locale = pathname.split("/")[1] || defaultLocale;
    const sessionCookie = request.cookies.get("food_cms_session");

    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/signin`, request.url)
      );
    }

    // Try fetching user from backend, but fail gracefully
    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Cookie: `food_cms_session=${sessionCookie.value}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data?.user;

          if (
            user &&
            ["admin", "super_admin", "manager"].includes(user.role || "")
          ) {
            return NextResponse.redirect(
              new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
            );
          }
        } else {
          console.warn("/auth/me returned", response.status);
          // Don't crash: just continue or redirect
        }
      } catch (err) {
        console.warn("Middleware fetch failed:", err);
        // Don't crash: just continue or redirect
      }
    }

    // Default fallback: redirect to signin if session exists but API fails
    return NextResponse.redirect(
      new URL(`/${locale}/auth/signin`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*|sitemap|robots).*)"],
};
