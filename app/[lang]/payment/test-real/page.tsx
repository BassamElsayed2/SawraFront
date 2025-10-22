import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { getDictionary } from "@/app/[lang]/dictionaries";
import PaymentResultClient from "@/app/[lang]/payment/result/payment-result-client";

interface PaymentTestRealPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentTestRealPage({
  params,
  searchParams,
}: PaymentTestRealPageProps) {
  const { lang } = await params;
  const searchParamsData = await searchParams;
  const orderId = Array.isArray(searchParamsData.id)
    ? searchParamsData.id[0]
    : searchParamsData.id;
  const dict = await getDictionary(lang);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar lang={lang} dict={dict} />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {lang === "ar"
                    ? "يرجى إضافة معرف الطلب في URL: /payment/test-real?id=ORDER_ID"
                    : "Please add order ID in URL: /payment/test-real?id=ORDER_ID"}
                </p>
                <div className="text-xs text-gray-500 text-center">
                  <p>
                    Debug: Search Params = {JSON.stringify(searchParamsData)}
                  </p>
                  <p>Debug: Order ID = {orderId || "undefined"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer lang={lang} dict={dict} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar lang={lang} dict={dict} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {lang === "ar"
                ? "اختبار صفحة الدفع الحقيقية"
                : "Real Payment Test Page"}
            </h1>
            <p className="mt-2 text-gray-600">
              {lang === "ar"
                ? "اختبار صفحة نتيجة الدفع بمعرف طلب حقيقي"
                : "Testing payment result page with real order ID"}
            </p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Real Order ID:</strong> {orderId}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {lang === "ar"
                  ? "هذا معرف طلب حقيقي من قاعدة البيانات"
                  : "This is a real order ID from database"}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center">
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground text-center">
                        {lang === "ar"
                          ? "جاري تحميل حالة الدفع..."
                          : "Loading payment status..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            }
          >
            <PaymentResultClient orderId={orderId} lang={lang} />
          </Suspense>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </div>
  );
}
