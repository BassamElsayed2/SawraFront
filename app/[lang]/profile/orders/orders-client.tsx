"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OrdersList } from "@/components/profile/orders-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History, Loader2 } from "lucide-react";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

interface OrdersClientProps {
  lang: "en" | "ar";
  dict: any;
}

export function OrdersClient({ lang, dict }: OrdersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(
        `/${lang}/auth/signin?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [user, loading, router, lang, pathname]);

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
              {dict.profile.orderHistory}
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
                  <span>{dict.profile.orderHistory}</span>
                </CardTitle>
                <CardDescription>
                  {lang === "ar"
                    ? "تتبع حالة طلباتك وتاريخ المشتريات"
                    : "Track your order status and purchase history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersList lang={lang} t={dict} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
