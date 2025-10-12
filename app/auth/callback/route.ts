import { createClient } from "@/services/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createClient();

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code:", error);
        // Extract lang from next parameter or default to 'ar'
        const lang = next?.split("/")[1] || "ar";

        // Redirect to forgot-password with error
        return NextResponse.redirect(
          new URL(
            `/${lang}/auth/forgot-password?error=invalid_link`,
            requestUrl.origin
          )
        );
      }

      // Successfully exchanged code for session
      // Redirect to the next URL (reset-password page)
      if (next) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      // Default redirect if no next parameter
      return NextResponse.redirect(
        new URL("/ar/auth/reset-password", requestUrl.origin)
      );
    } catch (error) {
      console.error("Error in auth callback:", error);
      const lang = next?.split("/")[1] || "ar";
      return NextResponse.redirect(
        new URL(
          `/${lang}/auth/forgot-password?error=callback_error`,
          requestUrl.origin
        )
      );
    }
  }

  // No code provided
  return NextResponse.redirect(new URL("/ar", requestUrl.origin));
}
