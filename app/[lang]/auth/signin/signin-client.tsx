"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SignInForm } from "@/components/auth/signin-form";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface SignInClientProps {
  lang: "en" | "ar";
  t: any;
}

export function SignInClient({ lang, t }: SignInClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already signed in, redirect to menu
    if (!loading && user) {
      router.push(`/${lang}/menu`);
    }
  }, [user, loading, router, lang]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </main>
    );
  }

  // If user is signed in, don't render the form (will redirect)
  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen flex">
      {/* Image Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 to-primary">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <Image
              src="/LogoElSawra.png"
              alt="Restaurant Logo"
              width={200}
              height={200}
              className="mx-auto mb-8"
            />
            <h1 className="text-5xl font-bold mb-4">
              {t.auth.welcomeBack || "Welcome Back!"}
            </h1>
            <p className="text-xl text-white/90">
              {t.auth.signInDescription ||
                "Sign in to access your account and enjoy our delicious meals"}
            </p>
          </div>
        </div>
        {/* Decorative Image Overlay */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/middle-eastern-mixed-grill.png"
            alt="Food Background"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:w-1/2 bg-gray-50">
        <div className="w-full max-w-md">
          <SignInForm lang={lang} t={t} />
        </div>
      </div>
    </main>
  );
}
