import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and auth callback
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".")
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

    try {
      // Verify session with backend
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `food_cms_session=${sessionCookie.value}`,
        },
      });

      if (!response.ok) {
        // Invalid session, redirect to signin
        const locale = pathname.split("/")[1] || defaultLocale;
        const redirectResponse = NextResponse.redirect(
          new URL(`/${locale}/auth/signin`, request.url)
        );
        redirectResponse.cookies.delete("food_cms_session");
        return redirectResponse;
      }

      const data = await response.json();
      const user = data.data?.user;

      // If user is admin, redirect them away
      if (
        user &&
        ["admin", "super_admin", "manager"].includes(user.role || "")
      ) {
        const locale = pathname.split("/")[1] || defaultLocale;
        return NextResponse.redirect(
          new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
        );
      }
    } catch (error) {
      // Auth verification failed - redirect to signin for safety
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
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico).*)",
  ],
};
