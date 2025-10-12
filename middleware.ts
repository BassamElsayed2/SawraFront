import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/services/supabase-middleware";
import { createServerClient } from "@supabase/ssr";

const locales = ["ar", "en"];
const defaultLocale = "ar";

function getLocale(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

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

  // Handle auth protection for profile routes
  if (pathname.includes("/profile")) {
    const response = await updateSession(request);

    // التحقق من أن المستخدم ليس admin
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // إذا المستخدم admin، قم بتسجيل خروجه وإعادة توجيهه
      if (adminProfile) {
        await supabase.auth.signOut();
        const locale = pathname.split("/")[1] || defaultLocale;
        return NextResponse.redirect(
          new URL(`/${locale}/auth/signin?error=admin-account`, request.url)
        );
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico).*)",
  ],
};
