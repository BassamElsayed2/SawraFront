"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddressesList } from "@/components/profile/addresses-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

interface AddressesClientProps {
  lang: "en" | "ar";
  dict: any;
}

export function AddressesClient({ lang, dict }: AddressesClientProps) {
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
              {dict.addresses.title}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "إدارة العناوين"
                : "Manage your delivery addresses"}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{dict.addresses.title}</span>
                  </div>
                  <Link href={`/${lang}/profile/addresses/add`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {dict.addresses.addAddress}
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  {lang === "ar"
                    ? "إضافة وإدارة العناوين للتوصيل للتسليم الأسرع"
                    : "Add and manage your delivery addresses for faster checkout"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressesList lang={lang} t={dict} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
