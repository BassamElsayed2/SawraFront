"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { Loader2 } from "lucide-react";

interface ForgotPasswordClientProps {
  lang: "en" | "ar";
  t: any;
}

export function ForgotPasswordClient({ lang, t }: ForgotPasswordClientProps) {
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
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
      <div className="relative min-h-screen flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 -z-10" />

        <div className="max-w-md w-full space-y-8">
          <ForgotPasswordForm lang={lang} t={t} />
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
