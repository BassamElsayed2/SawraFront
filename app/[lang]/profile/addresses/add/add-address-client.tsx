"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddressForm } from "@/components/profile/address-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

interface AddAddressClientProps {
  lang: "en" | "ar";
  dict: any;
}

export function AddAddressClient({ lang, dict }: AddAddressClientProps) {
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
            <Link href={`/${lang}/profile/addresses`}>
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {lang === "ar" ? "العودة إلى العناوين" : "Back to Addresses"}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {dict.addresses.addAddress}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "إضافة عنوان توصيل جديد"
                : "Add a new delivery address"}
            </p>
          </div>

          <AddressForm lang={lang} t={dict} />
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
