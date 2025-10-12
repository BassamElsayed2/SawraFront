import { getDictionary } from "@/app/[lang]/dictionaries";
import { createClient } from "@/services/supabase-server";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/profile/address-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";

interface AddAddressPageProps {
  params: { lang: "en" | "ar" };
}

export default async function AddAddressPage({ params }: AddAddressPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${lang}/auth/signin`);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
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
              {t.addresses.addAddress}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "إضافة عنوان توصيل جديد"
                : "Add a new delivery address"}
            </p>
          </div>

          <AddressForm lang={lang} t={t} />
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
