"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentStatus from "@/components/payment/payment-status";
import { ordersApi } from "@/services/apiOrders";
import { paymentsApi } from "@/services/apiPayments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentResultClientProps {
  orderId?: string;
  lang: "en" | "ar";
}

export default function PaymentResultClient({
  orderId: initialOrderId,
  lang,
}: PaymentResultClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | undefined>(initialOrderId);
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);
  const [showCancelOption, setShowCancelOption] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Try to get order ID from multiple sources
    let finalOrderId = initialOrderId;

    // 1. Try from URL search params
    if (!finalOrderId) {
      const urlOrderId = searchParams.get("id");
      if (urlOrderId) {
        finalOrderId = urlOrderId;
      }
    }

    // 2. Try from sessionStorage (stored before redirecting to EasyKash)
    if (!finalOrderId) {
      const storedOrderId = sessionStorage.getItem("pending_order_id");
      const storedPaymentId = sessionStorage.getItem("pending_payment_id");

      if (storedOrderId) {
        finalOrderId = storedOrderId;

        if (storedPaymentId) {
          setPaymentId(storedPaymentId);
        }

        // Clear from sessionStorage after reading
        sessionStorage.removeItem("pending_order_id");
        sessionStorage.removeItem("pending_payment_id");
      }
    }

    // Update state if we found an order ID
    if (finalOrderId && finalOrderId !== orderId) {
      setOrderId(finalOrderId);
    }

    // Show cancel option after 10 seconds if payment is still pending
    const cancelTimeout = setTimeout(() => {
      setShowCancelOption(true);
    }, 10000); // 10 seconds

    // Cleanup timeout
    return () => {
      clearTimeout(cancelTimeout);
    };
  }, [initialOrderId, searchParams]);

  // Handle payment cancellation
  const handleCancelPayment = async () => {
    if (!paymentId) {
      // Try to get payment from order
      try {
        const { data: payment } = await paymentsApi.getPaymentByOrderId(
          orderId!
        );
        if (payment) {
          setPaymentId(payment.id);
          await cancelPaymentById(payment.id);
        } else {
          toast({
            title: lang === "ar" ? "خطأ" : "Error",
            description:
              lang === "ar"
                ? "لم يتم العثور على معلومات الدفع"
                : "Payment information not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        // Error finding payment
      }
      return;
    }

    await cancelPaymentById(paymentId);
  };

  const cancelPaymentById = async (id: string) => {
    try {
      setIsCancelling(true);
      const { data, error } = await paymentsApi.cancelPayment(id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: lang === "ar" ? "تم الإلغاء" : "Cancelled",
        description:
          lang === "ar"
            ? "تم إلغاء الدفع بنجاح"
            : "Payment cancelled successfully",
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to cancel payment",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Show loading state if order ID is not yet determined
  if (!orderId) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                {lang === "ar"
                  ? "جاري تحميل تفاصيل الطلب..."
                  : "Loading order details..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <PaymentStatus
        orderId={orderId}
        showOrderLink={true}
        autoRefresh={true}
        refreshInterval={3000}
        lang={lang}
      />
    </div>
  );
}
