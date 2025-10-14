"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  variant?: "light" | "dark"; // light for navBarTwo (white bg), dark for navbarOne (dark bg)
}

export function UserMenu({
  lang,
  t,
  isMobile = false,
  variant = "dark",
}: UserMenuProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
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
        <div className="flex flex-col gap-3 w-full">
          <Link href={`/${lang}/auth/signin`} className="w-full">
            <Button
              variant="outline"
              className="w-full bg-transparent border-red-600/50 text-foreground hover:bg-red-50 hover:border-red-600 transition-all duration-300 font-medium py-6 rounded-xl shadow-sm hover:shadow-md"
            >
              {t.auth.signIn}
            </Button>
          </Link>
          <Link href={`/${lang}/auth/signup`} className="w-full">
            <Button className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-none transition-all duration-300 font-medium py-6 rounded-xl shadow-md hover:shadow-lg">
              {t.auth.signUp}
            </Button>
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
      <div className="flex flex-col space-y-3 w-full">
        {/* User Info Card */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
          <Avatar className="h-12 w-12 ring-2 ring-red-600">
            <AvatarFallback className="bg-red-600 text-white">
              {user?.full_name
                ? getInitials(user.full_name)
                : user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {user?.full_name || t.common?.user || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2">
          <Link href={`/${lang}/profile`}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 transition-all duration-200 py-6 rounded-xl font-medium"
            >
              <User className="h-5 w-5" />
              <span>{t.profile.title}</span>
            </Button>
          </Link>
          <Link href={`/${lang}/profile/addresses`}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 transition-all duration-200 py-6 rounded-xl font-medium"
            >
              <MapPin className="h-5 w-5" />
              <span>{t.profile.addresses}</span>
            </Button>
          </Link>
          <Link href={`/${lang}/profile/orders`}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 transition-all duration-200 py-6 rounded-xl font-medium"
            >
              <History className="h-5 w-5" />
              <span>{t.profile.orderHistory}</span>
            </Button>
          </Link>
          <div className="border-t border-border/20 my-2" />
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 transition-all duration-200 py-6 rounded-xl font-medium text-red-600 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span>
              {isLoading
                ? t.auth.signingOut || "جاري تسجيل الخروج..."
                : t.auth.signOut}
            </span>
          </Button>
        </div>
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
