"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Globe,
  Home,
  UtensilsCrossed,
  MapPin,
  ChefHat,
} from "lucide-react";
import Image from "next/image";
import { UserMenu } from "@/components/auth/user-menu";
import CartIcon from "@/components/cart-icon";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { cn } from "@/lib/utils";

interface NavbarProps {
  lang: "en" | "ar";
  dict: any;
}

const navIcons = {
  home: Home,
  menu: UtensilsCrossed,
  branches: MapPin,
} as const;

export default function Navbar({ lang, dict }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAr = lang === "ar";

  const navItems = [
    { href: `/${lang}`, label: dict.nav.home, icon: navIcons.home, exact: true },
    { href: `/${lang}/menu`, label: dict.nav.menu, icon: navIcons.menu },
    {
      href: `/${lang}/branches`,
      label: dict.nav.branches,
      icon: navIcons.branches,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    window.location.href = newPath;
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (!mounted) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-red-600" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-full bg-gray-200" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gray-200/80 bg-white/95 py-2 shadow-md shadow-gray-200/40 backdrop-blur-xl"
          : "border-b border-gray-100/80 bg-white/85 py-2.5 backdrop-blur-lg sm:py-3",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
        {/* Logo */}
        <Link
          href={`/${lang}`}
          className="group flex shrink-0 items-center"
        >
          <Image
            width={120}
            height={36}
            src="/LogoElSawra.png"
            alt="El Sawra Restaurant"
            className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-red-600 text-white shadow-sm shadow-red-200"
                    : "text-gray-600 hover:bg-red-50 hover:text-red-600",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1.5 lg:flex xl:gap-2">
          <CartIcon lang={lang} dict={dict} variant="light" />
          <UserMenu lang={lang} t={dict} variant="light" />
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-red-200 transition-all hover:bg-red-500 active:scale-[0.98] xl:px-4"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          <CartIcon lang={lang} dict={dict} variant="light" />

          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-all hover:bg-red-500 active:scale-[0.98]"
          >
            <Globe className="h-4 w-4" />
          </button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={isAr ? "فتح القائمة" : "Open menu"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:border-red-200 hover:text-red-600 active:scale-[0.98]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              showClose={false}
              hideTitle
              title={isAr ? "القائمة" : "Menu"}
              className="border-0 p-0 shadow-2xl"
            >
              <MobileNavDrawer
                lang={lang}
                dict={dict}
                navItems={navItems}
                isActive={isActive}
                onClose={() => setIsOpen(false)}
                onToggleLanguage={toggleLanguage}
                userMenuVariant="light"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
