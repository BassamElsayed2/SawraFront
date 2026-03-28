"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, ChefHat } from "lucide-react";
import Image from "next/image";
import { UserMenu } from "@/components/auth/user-menu";
import CartIcon from "@/components/cart-icon";

interface NavbarProps {
  lang: "en" | "ar";
  dict: any;
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    window.location.href = newPath;
  };

  const navItems = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/menu`, label: dict.nav.menu },
    { href: `/${lang}/branches`, label: dict.nav.branches },
  ];

  // Render null or a placeholder until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md border-b border-border/50 shadow-sm py-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ChefHat className="h-10 w-10 text-foreground" />
              <span className="text-2xl font-bold text-foreground">
                Restaurant
              </span>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-md border-b border-border/50 shadow-sm py-2">
      <div className="container mx-auto px-6 ">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center group">
            <Image
              width={130}
              height={40}
              src="/LogoElSawra.png"
              alt="El Sawra Restaurant"
              className="object-contain transition-transform duration-200 group-hover:scale-105 "
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-10 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-red-500 transition-all duration-200 font-[200] text-[13px] relative group text-black"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}

            {/* Cart Icon */}
            <CartIcon lang={lang} dict={dict} variant="light" />

            {/* User Menu */}
            <UserMenu lang={lang} t={dict} variant="light" />

            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="bg-red-600 border-none text-foreground hover:bg-red-500 text-white hover:border-red-500 transition-all duration-200 font-medium px-3 xl:px-4 py-2"
            >
              <Globe className="h-4 w-4 mr-1.5 xl:mr-2 rtl:mr-0 rtl:ml-1.5 xl:rtl:ml-2" />
              {lang === "en" ? "العربية" : "English"}
            </Button>
          </div>

          {/* Mobile & Tablet Navigation */}
          <div className="lg:hidden flex items-center space-x-3 rtl:space-x-reverse">
            <CartIcon lang={lang} dict={dict} variant="light" />

            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="bg-red-600 border-none text-foreground hover:bg-red-500 text-white hover:border-red-500 transition-all duration-200"
            >
              <Globe className="h-4 w-4 " />
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-red-600 border-none text-foreground hover:bg-red-500 text-white hover:border-red-500 transition-all duration-200"
                >
                  <Menu className="h-4 w-4 " />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={lang === "ar" ? "left" : "right"}
                className="w-[320px] sm:w-[380px] md:w-[420px] bg-background/95 backdrop-blur-md"
              >
                <div className="flex flex-col space-y-6 mt-8 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-xl md:text-2xl font-medium hover:text-red-500 transition-colors duration-200 py-3 md:py-4 border-b border-border/20 last:border-b-0"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Auth Buttons for Mobile */}
                  <div className="flex flex-col gap-3 md:gap-4 pt-4 border-t border-border/20">
                    <UserMenu
                      lang={lang}
                      t={dict}
                      isMobile={true}
                      variant="light"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
