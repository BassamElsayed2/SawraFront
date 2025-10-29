"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddressForm } from "@/components/profile/address-form";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import apiClient from "@/services/api-client";

interface EditAddressClientProps {
  lang: "en" | "ar";
  dict: any;
  addressId: string;
}

export default function EditAddressClient({
  lang,
  dict,
  addressId,
}: EditAddressClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!authLoading && !user) {
      router.push(`/${lang}/auth/signin`);
      return;
    }

    // Fetch address data
    const fetchAddress = async () => {
      try {
        setLoading(true);
        // Get all addresses since there's no GET by ID endpoint
        const response: any = await apiClient.get(`/addresses`);

        if (response.data) {
          // response.data is the array directly
          const addresses = Array.isArray(response.data) ? response.data : [];

          // Find the specific address by ID
          const foundAddress = addresses.find(
            (addr: any) => addr.id === addressId
          );

          if (foundAddress) {
            setAddress(foundAddress);
          } else {
            setError("Address not found");
          }
        } else {
          setError("Failed to fetch addresses");
        }
      } catch (err: any) {
        // Error is logged internally by the API service
        if (
          err.message?.includes("401") ||
          err.message?.includes("Unauthorized")
        ) {
          router.push(`/${lang}/auth/signin`);
        } else {
          setError(
            lang === "ar" ? "فشل تحميل العنوان" : "Failed to load address"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAddress();
    }
  }, [user, authLoading, addressId, lang, router]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar lang={lang} dict={dict} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              {lang === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </main>
    );
  }

  if (error || !address) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar lang={lang} dict={dict} />
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lang === "ar" ? "العنوان غير موجود" : "Address not found"}
              </h2>
              <p className="text-gray-600 mb-6">
                {error ||
                  (lang === "ar"
                    ? "العنوان المطلوب غير موجود"
                    : "The requested address was not found")}
              </p>
              <Link href={`/${lang}/profile/addresses`}>
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {lang === "ar" ? "العودة إلى العناوين" : "Back to Addresses"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </main>
    );
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
              {dict.addresses.editAddress}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "تحديث عنوان التوصيل"
                : "Update your delivery address"}
            </p>
          </div>

          <AddressForm initialData={address} lang={lang} t={dict} />
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
