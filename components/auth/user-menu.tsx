"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { LogOut, User, MapPin, History, Loader2 } from "lucide-react";

interface Translations {
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    signOutError?: string;
    signingOut?: string;
  };
  profile: {
    title: string;
    addresses: string;
    orderHistory: string;
  };
  common?: {
    error?: string;
    user?: string;
  };
}

interface UserMenuProps {
  lang: string;
  t: Translations;
  isMobile?: boolean;
  variant?: "light" | "dark";
}

function MobileMenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-red-600">
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}

export function UserMenu({
  lang,
  t,
  isMobile = false,
  variant = "dark",
}: UserMenuProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Use window.location for hard navigation to ensure clean state
      window.location.href = `/${lang}`;
    } catch (error) {
      // Error is logged internally by the auth service
      toast({
        title: t.common?.error || "خطأ",
        description: t.auth?.signOutError || "فشل تسجيل الخروج، حاول مرة أخرى",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!user) {
    // Mobile Layout
    if (isMobile) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/${lang}/auth/signin`} className="block">
            <span className="flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[0.98]">
              {t.auth.signIn}
            </span>
          </Link>
          <Link href={`/${lang}/auth/signup`} className="block">
            <span className="flex h-11 items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 active:scale-[0.98]">
              {t.auth.signUp}
            </span>
          </Link>
        </div>
      );
    }

    // Desktop Layout
    const isDark = variant === "dark";

    return (
      <div className="flex items-center gap-3 rtl:gap-3">
        <Link href={`/${lang}/auth/signin`}>
          <Button
            variant="outline"
            size="sm"
            className={`
              transition-all duration-300 font-medium px-6 py-2 rounded-full shadow-sm hover:shadow-md
              ${
                isDark
                  ? "bg-transparent border-white/30 text-white hover:bg-white hover:text-red-600"
                  : "bg-white border-red-600/30 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
              }
            `}
          >
            {t.auth.signIn}
          </Button>
        </Link>
        <Link href={`/${lang}/auth/signup`}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-none transition-all duration-300 font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105"
          >
            {t.auth.signUp}
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile Layout for logged in user
  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-3 py-3">
          <Avatar className="h-11 w-11 ring-2 ring-red-600">
            <AvatarFallback className="bg-red-600 text-white text-sm">
              {user?.full_name
                ? getInitials(user.full_name)
                : user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.full_name || t.common?.user || "User"}
            </p>
            <p className="truncate text-xs text-gray-500" dir="ltr">
              {user.email}
            </p>
          </div>
        </div>

        <MobileMenuLink
          href={`/${lang}/profile`}
          icon={User}
          label={t.profile.title}
        />
        <MobileMenuLink
          href={`/${lang}/profile/addresses`}
          icon={MapPin}
          label={t.profile.addresses}
        />
        <MobileMenuLink
          href={`/${lang}/profile/orders`}
          icon={History}
          label={t.profile.orderHistory}
        />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoading}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </span>
          {isLoading
            ? t.auth.signingOut || "جاري تسجيل الخروج..."
            : t.auth.signOut}
        </button>
      </div>
    );
  }

  // Desktop Layout
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.full_name
                ? getInitials(user.full_name)
                : user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.full_name || t.common?.user || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t.profile.title}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile/addresses`} className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{t.profile.addresses}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile/orders`} className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>{t.profile.orderHistory}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? t.auth.signingOut || "جاري الخروج..." : t.auth.signOut}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
