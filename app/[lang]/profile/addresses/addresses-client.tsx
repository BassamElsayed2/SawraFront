"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AddressesList } from "@/components/profile/addresses-list";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

interface AddressesClientProps {
  lang: "en" | "ar";
  dict: any;
}

export function AddressesClient({ lang, dict }: AddressesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAr = lang === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!loading && !user) {
      const next = `/${lang}/auth/signin?redirect=${encodeURIComponent(pathname)}`;
      router.push(next);
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

  return (
    <main className="min-h-dvh bg-background">
      <Navbar lang={lang} dict={dict} />

      <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-br from-red-50 via-white to-amber-50 pb-24 pt-24 sm:pb-20 sm:pt-28 lg:pb-16 lg:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl sm:h-96 sm:w-96"
        />

        <div className="relative mx-auto w-full max-w-3xl px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link href={`/${lang}/profile`}>
              <span className="mb-4 inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:border-red-200 hover:text-red-600 active:scale-[0.98] sm:mb-5 sm:h-10 sm:px-5">
                <BackArrow className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">{isAr ? "الملف" : "Profile"}</span>
                <span className="hidden sm:inline">
                  {isAr ? "العودة للملف الشخصي" : "Back to Profile"}
                </span>
              </span>
            </Link>

            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-200 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                    {dict.addresses.title}
                  </h1>
                  <p className="mt-0.5 text-sm text-gray-500 sm:mt-1">
                    {isAr
                      ? "إدارة عناوين التوصيل الخاصة بك"
                      : "Manage your delivery addresses"}
                  </p>
                </div>
              </div>

              <Link
                href={`/${lang}/profile/addresses/add`}
                className="hidden shrink-0 sm:inline-flex"
              >
                <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:bg-red-500 hover:shadow-lg active:scale-[0.98]">
                  <Plus className="h-4 w-4" />
                  {dict.addresses.addAddress}
                </span>
              </Link>
            </div>
          </div>

          <AddressesList lang={lang} t={dict} />
        </div>

        {/* Mobile FAB */}
        <Link
          href={`/${lang}/profile/addresses/add`}
          className="fixed bottom-5 end-4 z-40 sm:hidden"
          aria-label={dict.addresses.addAddress}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-300/60 transition-all hover:bg-red-500 hover:shadow-2xl active:scale-95">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      <Footer lang={lang} dict={dict} />
    </main>
  );
}
