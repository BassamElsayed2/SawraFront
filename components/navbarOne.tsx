"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, ChefHat } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  lang: "en" | "ar";
  dict: any;
}

export default function NavbarOne({ lang, dict }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();


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

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleHotlineClick = () => {
    if (!mounted) return;
  
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
  
    if (isMobile) {
      window.open("tel:17533", "_self");
    } else {
      alert(lang === "ar" ? "الاتصال متاح فقط من الهاتف" : "Calling is available only on mobile");
    }
  };
  

  return (
    <nav className="nav">
      <div className="container mx-auto px-6 ">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex gap-5">
            <Link href={`/${lang}`} className="flex items-center group ">
              <Image
                width={130}
                height={40}
                src="/LogoElSawra.png"
                alt="El Sawra Restaurant"
                className="object-contain transition-transform duration-200 group-hover:scale-105 "
              />
            </Link>

            <div className="hotline-container ">
              <button
                onClick={handleHotlineClick}
                className="hotline-button"
                aria-label={lang === "ar" ? "اتصل بنا الآن" : "Call us now"}
              >
                <div className="hotline-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="hotline-text">
                  <span className="hotline-label">
                    {lang === "ar" ? "خط ساخن" : "Hotline"}
                  </span>
                  <span className="hotline-number">17533</span>
                </div>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-yellow-500 transition-all duration-200 font-[200] text-[13px] relative group text-white"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="bg-red-600 border-none text-foreground hover:bg-red-500 text-white hover:border-red-500 transition-all duration-200 font-medium px-4 py-2"
              style={{ borderRadius: "20px 10px 10px 20px" }}
            >
              <Globe className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {lang === "en" ? "العربية" : "English"}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-3 rtl:space-x-reverse">
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
                className="w-[300px] bg-background/95 backdrop-blur-md"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-xl font-medium hover:text-red-500 transition-colors duration-200 py-2 border-b border-border/20 last:border-b-0"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
