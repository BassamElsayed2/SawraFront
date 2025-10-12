import { getDictionary } from "@/app/[lang]/dictionaries";
import { createClient } from "@/services/supabase-server";
import { redirect, notFound } from "next/navigation";
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

interface EditAddressPageProps {
  params: { lang: "en" | "ar"; id: string };
}

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const { lang, id } = await params;
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

  // Get address data
  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (addressError || !address) {
    notFound();
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
              {t.addresses.editAddress}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "تحديث عنوان التوصيل"
                : "Update your delivery address"}
            </p>
          </div>

          <AddressForm initialData={address} lang={lang} t={t} />
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
