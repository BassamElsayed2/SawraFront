"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, User } from "lucide-react";

interface ProfilePageClientProps {
  lang: "en" | "ar";
  dict: any;
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() || "?";
}

export function ProfilePageClient({ lang, dict }: ProfilePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAr = lang === "ar";

  useEffect(() => {
    if (!loading && !user) {
      router.push(
        `/${lang}/auth/signin?redirect=${encodeURIComponent(pathname)}`,
      );
    }
  }, [user, loading, router, lang, pathname]);

  if (loading) {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-red-50 via-white to-amber-50">
        <Navbar lang={lang} dict={dict} />
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm text-gray-500">
            {isAr ? "جارٍ التحقق..." : "Checking session..."}
          </p>
        </div>
        <Footer lang={lang} dict={dict} />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.full_name?.trim() ||
    user.email?.split("@")[0] ||
    (isAr ? "مستخدم" : "User");

  return (
    <main className="min-h-dvh bg-background">
      <Navbar lang={lang} dict={dict} />

      <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-br from-red-50 via-white to-amber-50 pb-16 pt-24 sm:pt-28 lg:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -end-32 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl sm:h-96 sm:w-96"
        />

        <div className="relative mx-auto w-full max-w-3xl px-3 sm:px-6 lg:px-8">
          {/* Profile hero */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:mb-8 sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-500 text-xl font-bold text-white shadow-lg shadow-red-200 sm:h-20 sm:w-20 sm:text-2xl">
                {getInitials(user.full_name, user.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-600 sm:text-sm">
                  {isAr ? "مرحباً" : "Welcome back"}
                </p>
                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                  {displayName}
                </h1>
                <p className="mt-0.5 truncate text-sm text-gray-500" dir="ltr">
                  {user.email}
                </p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:flex">
                <User className="h-6 w-6" />
              </div>
            </div>
          </div>

          <ProfileTabs user={user} profile={user} lang={lang} t={dict} />
        </div>
      </div>

      <Footer lang={lang} dict={dict} />
    </main>
  );
}
