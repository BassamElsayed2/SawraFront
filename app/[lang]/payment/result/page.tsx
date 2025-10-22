import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/navBarTwo";
import Footer from "@/components/footer";
import { getDictionary } from "@/app/[lang]/dictionaries";
import PaymentResultClient from "@/app/[lang]/payment/result/payment-result-client";

interface PaymentResultPageProps {
  params: Promise<{ lang: "en" | "ar" }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentResultPage({
  params,
  searchParams,
}: PaymentResultPageProps) {
  const { lang } = await params;
  const searchParamsData = await searchParams;
  const orderId = Array.isArray(searchParamsData.id)
    ? searchParamsData.id[0]
    : searchParamsData.id;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-background">
      <Navbar lang={lang} dict={dict} />
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Payment Result Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {lang === "ar" ? "نتيجة الدفع" : "Payment Result"}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {lang === "ar"
                ? "يرجى الانتظار للتحقق من حالة الدفع..."
                : "Please wait while we verify your payment status..."}
            </p>
          </div>

          {/* Payment Status Component */}
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground text-center">
                        {lang === "ar"
                          ? "جاري تحميل تفاصيل الدفع..."
                          : "Loading payment details..."}
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
