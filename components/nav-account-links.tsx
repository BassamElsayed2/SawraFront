"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

type Variant = "desktopLight" | "desktopDark" | "mobileSheet" | "footer";

interface NavAccountLinksProps {
  lang: "en" | "ar";
  dict: {
    nav: { account?: string; addressesLink?: string };
    profile: { title: string; addresses: string };
  };
  variant: Variant;
  onNavigate?: () => void;
}

export function NavAccountLinks({
  lang,
  dict,
  variant,
  onNavigate,
}: NavAccountLinksProps) {
  const { user, loading } = useAuth();
  const accountLabel = dict.nav.account ?? dict.profile.title;
  const addressesLabel = dict.nav.addressesLink ?? dict.profile.addresses;

  if (loading) {
    return variant === "footer" ? null : (
      <span className="h-4 w-20 bg-muted/30 rounded animate-pulse inline-block align-middle" />
    );
  }

  if (!user) {
    return null;
  }

  if (variant === "footer") {
    return (
      <>
        <li>
          <Link
            href={`/${lang}/profile`}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            {accountLabel}
          </Link>
        </li>
        <li>
          <Link
            href={`/${lang}/profile/addresses`}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            {addressesLabel}
          </Link>
        </li>
      </>
    );
  }

  const desktopLight =
    "text-foreground/80 hover:text-red-500 transition-all duration-200 font-[200] text-[13px] relative group text-black inline-flex items-center";
  const desktopDark =
    "text-foreground/80 hover:text-yellow-500 transition-all duration-200 font-[200] text-[13px] relative group text-white inline-flex items-center";
  const mobileSheet =
    "text-xl md:text-2xl font-medium hover:text-red-500 transition-colors duration-200 py-3 md:py-4 border-b border-border/20 block";

  const desktopClass =
    variant === "desktopDark" ? desktopDark : desktopLight;
  const barClass =
    variant === "desktopDark" ? "bg-yellow-500" : "bg-red-500";

  if (variant === "mobileSheet") {
    return (
      <>
        <Link
          href={`/${lang}/profile`}
          className={mobileSheet}
          onClick={onNavigate}
        >
          {accountLabel}
        </Link>
        <Link
          href={`/${lang}/profile/addresses`}
          className={mobileSheet}
          onClick={onNavigate}
        >
          {addressesLabel}
        </Link>
      </>
    );
  }

  return (
    <div className="flex items-center gap-4 xl:gap-5 rtl:gap-4">
      <Link
        href={`/${lang}/profile`}
        className={desktopClass}
        onClick={onNavigate}
      >
        {accountLabel}
        <span
          className={`absolute -bottom-1 left-0 w-0 h-0.5 ${barClass} transition-all duration-200 group-hover:w-full`}
        />
      </Link>
      <Link
        href={`/${lang}/profile/addresses`}
        className={desktopClass}
        onClick={onNavigate}
      >
        {addressesLabel}
        <span
          className={`absolute -bottom-1 left-0 w-0 h-0.5 ${barClass} transition-all duration-200 group-hover:w-full`}
        />
      </Link>
    </div>
  );
}
