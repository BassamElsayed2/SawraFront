import { getDictionary } from "@/app/[lang]/dictionaries";
import { redirect } from "next/navigation";
import { OrdersList } from "@/components/profile/orders-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { cookies } from "next/headers";

interface OrdersPageProps {
  params: { lang: "en" | "ar" };
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  // Check authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    redirect(`/${lang}/auth/signin`);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar lang={lang} dict={t} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.profile.orderHistory}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "عرض وإدارة طلباتك"
                : "View and manage your orders"}
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>{t.profile.orderHistory}</span>
                </CardTitle>
                <CardDescription>
                  {lang === "ar"
                    ? "تتبع حالة طلباتك وتاريخ المشتريات"
                    : "Track your order status and purchase history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersList lang={lang} t={t} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={t} />
    </main>
  );
}
