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
  Phone,
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

export default function NavbarOne({ lang, dict }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    window.location.href = newPath;
  };

  const handleHotlineClick = () => {
    if (!mounted) return;

    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      window.open("tel:17533", "_self");
    } else {
      alert(
        isAr
          ? "الاتصال متاح فقط من الهاتف"
          : "Calling is available only on mobile",
      );
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (!mounted) {
    return (
      <nav className="nav opacity-0">
        <div className="container mx-auto px-6" />
      </nav>
    );
  }

  return (
    <nav className="nav">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo + hotline */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href={`/${lang}`} className="group flex shrink-0 items-center">
              <Image
                width={120}
                height={36}
                src="/LogoElSawra.png"
                alt="El Sawra Restaurant"
                className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9"
                priority
              />
            </Link>

            <button
              type="button"
              onClick={handleHotlineClick}
              className="hotline-button hidden md:flex"
              aria-label={isAr ? "اتصل بنا الآن" : "Call us now"}
            >
              <span className="hotline-icon">
                <Phone className="h-4 w-4" />
              </span>
              <span className="hotline-text">
                <span className="hotline-label">
                  {isAr ? "خط ساخن" : "Hotline"}
                </span>
                <span className="hotline-number">17533</span>
              </span>
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-white/25 text-white shadow-sm backdrop-blur-sm"
                      : "text-white/85 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <CartIcon lang={lang} dict={dict} variant="dark" />
            <UserMenu lang={lang} t={dict} />

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-500 active:scale-[0.98] xl:px-4"
            >
              <Globe className="h-4 w-4" />
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <CartIcon lang={lang} dict={dict} variant="dark" />

            <Link href={`/${lang}/menu`}>
              <span className="inline-flex h-9 items-center rounded-full bg-red-600 px-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-red-500 active:scale-[0.98] sm:px-3.5 sm:text-sm">
                {dict.nav.menu}
              </span>
            </Link>

            <button
              type="button"
              onClick={handleHotlineClick}
              aria-label={isAr ? "اتصل بنا" : "Call us"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-all hover:bg-red-500 active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 active:scale-[0.98]"
            >
              <Globe className="h-4 w-4" />
            </button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={isAr ? "فتح القائمة" : "Open menu"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 active:scale-[0.98]"
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
                  onHotlineClick={handleHotlineClick}
                  userMenuVariant="light"
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
