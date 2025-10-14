"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProfilePageClientProps {
  lang: "en" | "ar";
  dict: any;
}

export function ProfilePageClient({ lang, dict }: ProfilePageClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${lang}/auth/signin`);
    }
  }, [user, loading, router, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={dict} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {dict.profile.title}
            </h1>
          </div>

          <ProfileTabs user={user} profile={user} lang={lang} t={dict} />
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
