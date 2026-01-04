import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

// Server-only env
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and auth callback
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

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Handle auth protection for profile routes using backend API
  if (pathname.includes("/profile")) {
    const sessionCookie = request.cookies.get("food_cms_session");

    // If no session cookie, redirect to signin
    if (!sessionCookie) {
      const locale = pathname.split("/")[1] || defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}/auth/signin`, request.url)
      );
    }

    let user = null;

    try {
      // Verify session with backend
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `food_cms_session=${sessionCookie.value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        user = data.data?.user;
      }
    } catch (error) {
      console.error("Middleware fetch failed:", error);
      // leave user null, redirect below
    }

    // If no user or user is admin, redirect to signin
    if (
      !user ||
      ["admin", "super_admin", "manager"].includes(user.role || "")
    ) {
      const locale = pathname.split("/")[1] || defaultLocale;
      const redirectResponse = NextResponse.redirect(
        new URL(
          `/${locale}/auth/signin${user ? "?error=admin-account" : ""}`,
          request.url
        )
      );
      redirectResponse.cookies.delete("food_cms_session");
      return redirectResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*|sitemap|robots).*)"],
};
