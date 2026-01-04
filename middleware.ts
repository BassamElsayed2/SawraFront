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

  // Handle locale redirect
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Handle auth for /profile routes
  if (pathname.includes("/profile")) {
    try {
      const sessionCookie = request.cookies.get("food_cms_session");

      // No session cookie → redirect to signin
      if (!sessionCookie) {
        const locale = pathname.split("/")[1] || defaultLocale;
        return NextResponse.redirect(
          new URL(`/${locale}/auth/signin`, request.url)
        );
      }

      // Only attempt fetch if API_URL exists
      if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `food_cms_session=${sessionCookie.value}`,
        },
      });

      if (!response.ok) {
        const locale = pathname.split("/")[1] || defaultLocale;
        const redirectResponse = NextResponse.redirect(
          new URL(`/${locale}/auth/signin`, request.url)
        );
        redirectResponse.cookies.delete("food_cms_session");
        return redirectResponse;
      }

      const data = await response.json();
      const user = data.data?.user;

      if (
        user &&
        ["admin", "super_admin", "manager"].includes(user.role || "")
      ) {
        const locale = pathname.split("/")[1] || defaultLocale;
        return NextResponse.redirect(
          new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
        );
      }
    } catch (err) {
      // Log the error for debugging
      console.error("Middleware /profile error:", err);

      // Fail gracefully: just redirect to signin or continue
      const locale = pathname.split("/")[1] || defaultLocale;
      const redirectResponse = NextResponse.redirect(
        new URL(`/${locale}/auth/signin`, request.url)
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
