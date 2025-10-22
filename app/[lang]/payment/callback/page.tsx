"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PaymentStatus from "@/components/payment/payment-status";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Extract language from pathname
  const lang = pathname.split("/")[1] as "en" | "ar";

  useEffect(() => {
    // Try to get payment ID from URL params first
    const urlPaymentId = searchParams.get("paymentId");
    const urlOrderId = searchParams.get("orderId");
    const urlTransactionId = searchParams.get("transactionId");

    // If not in URL, try sessionStorage
    const storedPaymentId = sessionStorage.getItem("pending_payment_id");
    const storedOrderId = sessionStorage.getItem("pending_order_id");

    const finalPaymentId = urlPaymentId || storedPaymentId;
    const finalOrderId = urlOrderId || storedOrderId;

    if (finalPaymentId) {
      setPaymentId(finalPaymentId);
      // Clear sessionStorage
      sessionStorage.removeItem("pending_payment_id");
    }

    if (finalOrderId) {
      setOrderId(finalOrderId);
      sessionStorage.removeItem("pending_order_id");
    }

    // If we have neither payment ID nor order ID, redirect to orders page
    if (!finalPaymentId && !finalOrderId) {
      setTimeout(() => {
        router.push("/orders");
      }, 3000);
    }
  }, [searchParams, router]);

  if (!paymentId && !orderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                {lang === "ar"
                  ? "جاري معالجة رد الدفع..."
                  : "Processing payment callback..."}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {lang === "ar"
                  ? "جاري التوجيه لصفحة الطلبات..."
                  : "Redirecting to orders page..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PaymentStatus
        paymentId={paymentId || undefined}
        orderId={orderId || undefined}
        showOrderLink={true}
        autoRefresh={true}
        refreshInterval={3000}
        lang={lang}
      />
    </div>
  );
}
