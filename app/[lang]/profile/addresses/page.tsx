import { getDictionary } from "@/app/[lang]/dictionaries";
import { createClient } from "@/services/supabase-server";
import { redirect } from "next/navigation";
import { AddressesList } from "@/components/profile/addresses-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";

interface AddressesPageProps {
  params: { lang: "en" | "ar" };
}

export default async function AddressesPage({ params }: AddressesPageProps) {
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

  // Get user addresses
  const { data: addresses, error: addressesError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (addressesError) {
    console.error("Error fetching addresses:", addressesError);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.addresses.title}
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
                    <span>{t.addresses.title}</span>
                  </div>
                  <Link href={`/${lang}/profile/addresses/add`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addresses.addAddress}
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
                <AddressesList addresses={addresses || []} lang={lang} t={t} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
