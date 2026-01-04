import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, auth callbacks, and special files
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
    return NextResponse.next();
  }

  // Redirect to default locale if missing
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  // Handle /profile routes only
  const isProfileRoute = locales.some((locale) =>
    pathname.startsWith(`/${locale}/profile`)
  );
  if (isProfileRoute) {
    const locale = pathname.split("/")[1] || defaultLocale;
    const sessionCookie = request.cookies.get("food_cms_session");

    // No session → redirect to signin
    if (!sessionCookie) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/signin`, request.url)
      );
    }

    // Fetch user from backend if API_URL is set
    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: { Cookie: `food_cms_session=${sessionCookie.value}` },
        });

        // If API fails or returns 404 → redirect to signin
        if (!response.ok) {
          console.warn(
            "[Middleware] /auth/me returned status",
            response.status
          );
          const redirectResponse = NextResponse.redirect(
            new URL(`/${locale}/auth/signin`, request.url)
          );
          redirectResponse.cookies.delete("food_cms_session");
          return redirectResponse;
        }

        const data = await response.json();
        const user = data.data?.user;

        // Block admin accounts
        if (
          user &&
          ["admin", "super_admin", "manager"].includes(user.role || "")
        ) {
          return NextResponse.redirect(
            new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
          );
        }

        // Valid non-admin session → continue
        return NextResponse.next();
      } catch (err) {
        console.warn("[Middleware] fetch /auth/me failed:", err);
        const redirectResponse = NextResponse.redirect(
          new URL(`/${locale}/auth/signin`, request.url)
        );
        redirectResponse.cookies.delete("food_cms_session");
        return redirectResponse;
      }
    }

    // If API_URL not set → log and continue (no crash)
    console.warn("[Middleware] NEXT_PUBLIC_API_URL not set");
    return NextResponse.next();
  }

  // All other routes → continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*|sitemap|robots).*)"],
};
