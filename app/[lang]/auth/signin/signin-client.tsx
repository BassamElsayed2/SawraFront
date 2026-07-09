"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { SignInForm } from "@/components/auth/signin-form";
import Image from "next/image";
import {
  Loader2,
  Globe,
  ArrowLeft,
  ArrowRight,
  UtensilsCrossed,
  Truck,
  BadgePercent,
} from "lucide-react";
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect";

interface SignInClientProps {
  lang: "en" | "ar";
  t: any;
  redirectParam?: string;
}

const features = {
  ar: [
    { icon: UtensilsCrossed, label: "مأكولات طازجة يومياً" },
    { icon: Truck, label: "توصيل سريع لباب منزلك" },
    { icon: BadgePercent, label: "عروض وخصومات حصرية" },
  ],
  en: [
    { icon: UtensilsCrossed, label: "Fresh meals every day" },
    { icon: Truck, label: "Fast delivery to your door" },
    { icon: BadgePercent, label: "Exclusive offers & deals" },
  ],
};

export function SignInClient({ lang, t, redirectParam }: SignInClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const whenLoggedInPath = getSafeAuthRedirectPath(
    redirectParam,
    `/${lang}/menu`,
  );
  const isAr = lang === "ar";
  const featureList = features[lang];
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    window.location.href = newPath;
  };

  useEffect(() => {
    if (!loading && user) {
      router.push(whenLoggedInPath);
    }
  }, [user, loading, router, whenLoggedInPath]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm text-gray-500">
            {isAr ? "جارٍ التحقق..." : "Checking session..."}
          </p>
        </div>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-50 via-white to-amber-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-red-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -end-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Link
          href={`/${lang}`}
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/LogoElSawra.png"
            alt="El Sawra"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${lang}/menu`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:border-red-200 hover:text-red-600 sm:px-4"
          >
            <BackArrow className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isAr ? "العودة للقائمة" : "Back to menu"}
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 sm:px-4"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-12 pt-4 md:px-8 lg:min-h-[calc(100vh-88px)] lg:justify-center lg:py-8">
        {/* Mobile feature chips */}
        <div className="mb-6 flex flex-wrap justify-center gap-2 lg:hidden">
          {featureList.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-red-700 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Hero panel */}
          <div className="relative order-2 hidden overflow-hidden rounded-3xl shadow-2xl lg:block">
            <Image
              src="/middle-eastern-mixed-grill.png"
              alt={isAr ? "مأكولات مطعم الثورة" : "El Sawra cuisine"}
              className="h-full min-h-[560px] w-full object-cover"
              width={640}
              height={640}
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <p className="mb-2 text-sm font-medium text-red-200">
                {isAr ? "مطعم الثورة" : "El Sawra Restaurant"}
              </p>
              <h1 className="mb-6 text-2xl font-bold leading-snug xl:text-3xl">
                {t.auth.welcomeBack}
              </h1>
              <p className="mb-8 max-w-md text-sm leading-relaxed text-white/80">
                {t.auth.signInDescription}
              </p>
              <ul className="space-y-3">
                {featureList.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/80">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel */}
          <div className="order-1 flex items-center lg:order-2">
            <div className="w-full rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-md md:p-10">
              <div className="mb-8 lg:hidden">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t.auth.welcomeBack}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {t.auth.signInDescription}
                </p>
              </div>

              <SignInForm lang={lang} t={t} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
