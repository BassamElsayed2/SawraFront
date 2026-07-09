"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AddressForm } from "@/components/profile/address-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

interface AddAddressClientProps {
  lang: "en" | "ar";
  dict: any;
}

const steps = {
  ar: [
    { short: "الخريطة", full: "حدد موقعك" },
    { short: "التفاصيل", full: "أكمل البيانات" },
    { short: "حفظ", full: "احفظ العنوان" },
  ],
  en: [
    { short: "Map", full: "Pin location" },
    { short: "Details", full: "Fill details" },
    { short: "Save", full: "Save address" },
  ],
};

export function AddAddressClient({ lang, dict }: AddAddressClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAr = lang === "ar";
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const stepList = steps[lang];

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

  return (
    <main className="min-h-dvh bg-background">
      <Navbar lang={lang} dict={dict} />

      <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-br from-red-50 via-white to-amber-50 pb-28 pt-24 sm:pb-20 sm:pt-28 lg:pb-16 lg:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl sm:h-96 sm:w-96"
        />

        <div className="relative mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <Link href={`/${lang}/profile/addresses`}>
              <Button
                variant="outline"
                size="sm"
                className="mb-4 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-red-200 hover:text-red-600 sm:mb-5 sm:h-10"
              >
                <BackArrow className="h-4 w-4 shrink-0" />
                <span className="ms-2 sm:hidden">
                  {isAr ? "عودة" : "Back"}
                </span>
                <span className="ms-2 hidden sm:inline">
                  {isAr ? "العودة إلى العناوين" : "Back to Addresses"}
                </span>
              </Button>
            </Link>

            <div className="flex items-center gap-3 sm:items-start sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-200 sm:h-12 sm:w-12 sm:rounded-2xl">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                  {dict.addresses.addAddress}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500 sm:mt-1">
                  {isAr
                    ? "حدد موقعك ثم أكمل التفاصيل"
                    : "Pin your location, then complete the details"}
                </p>
              </div>
            </div>
          </div>

          {/* Compact step progress — works on all screen sizes */}
          <nav
            aria-label={isAr ? "خطوات إضافة العنوان" : "Add address steps"}
            className="mb-5 sm:mb-8"
          >
            <ol className="flex items-start">
              {stepList.map((step, index) => (
                <li
                  key={step.full}
                  className={`flex min-w-0 flex-1 items-start ${
                    index < stepList.length - 1 ? "pe-1 sm:pe-2" : ""
                  }`}
                >
                  <div className="flex w-full min-w-0 flex-col items-center gap-1.5">
                    <div className="flex w-full items-center">
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="h-0.5 flex-1 bg-red-100"
                        />
                      )}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                        {index + 1}
                      </span>
                      {index < stepList.length - 1 && (
                        <span
                          aria-hidden
                          className="h-0.5 flex-1 bg-red-100"
                        />
                      )}
                    </div>
                    <span className="w-full truncate px-0.5 text-center text-[11px] font-medium text-gray-600 sm:text-xs">
                      <span className="sm:hidden">{step.short}</span>
                      <span className="hidden sm:inline">{step.full}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          <AddressForm lang={lang} t={dict} stickySubmit />
        </div>
      </div>

      <Footer lang={lang} dict={dict} />
    </main>
  );
}
