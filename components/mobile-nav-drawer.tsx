"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Phone, Globe, LucideIcon } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface MobileNavDrawerProps {
  lang: "en" | "ar";
  dict: any;
  navItems: MobileNavItem[];
  isActive: (href: string, exact?: boolean) => boolean;
  onClose: () => void;
  onToggleLanguage: () => void;
  onHotlineClick?: () => void;
  userMenuVariant?: "light" | "dark";
}

export function MobileNavDrawer({
  lang,
  dict,
  navItems,
  isActive,
  onClose,
  onToggleLanguage,
  onHotlineClick,
  userMenuVariant = "light",
}: MobileNavDrawerProps) {
  const isAr = lang === "ar";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
        <Link href={`/${lang}`} onClick={onClose} className="min-w-0">
          <Image
            width={110}
            height={32}
            src="/LogoElSawra.png"
            alt="El Sawra"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <SheetClose asChild>
          <button
            type="button"
            aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetClose>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {onHotlineClick && (
          <button
            type="button"
            onClick={() => {
              onHotlineClick();
              onClose();
            }}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-3.5 text-white shadow-md shadow-red-200 transition-transform active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Phone className="h-5 w-5" />
            </span>
            <span className="text-start">
              <span className="block text-xs font-medium opacity-90">
                {isAr ? "خط ساخن" : "Hotline"}
              </span>
              <span className="block text-lg font-bold tracking-wide">
                17533
              </span>
            </span>
          </button>
        )}

        <nav className="space-y-1.5">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {isAr ? "التنقل" : "Navigation"}
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-all active:scale-[0.99]",
                  active
                    ? "bg-red-600 text-white shadow-sm shadow-red-200"
                    : "text-gray-800 hover:bg-red-50 hover:text-red-600",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-white/20" : "bg-gray-100 text-red-600",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {isAr ? "الحساب" : "Account"}
          </p>
          <UserMenu
            lang={lang}
            t={dict}
            isMobile
            variant={userMenuVariant}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onToggleLanguage}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-all hover:border-red-200 hover:text-red-600 active:scale-[0.98]"
        >
          <Globe className="h-4 w-4 text-red-600" />
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>
    </div>
  );
}
