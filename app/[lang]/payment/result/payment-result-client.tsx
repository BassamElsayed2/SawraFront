"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaymentStatus from "@/components/payment/payment-status";
import { paymentsApi, Payment } from "@/services/apiPayments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CANCEL_AFTER_MS = 5 * 60 * 1000; // 5 minutes

interface PaymentResultClientProps {
  orderId?: string;
  lang: "en" | "ar";
}

export default function PaymentResultClient({
  orderId: initialOrderId,
  lang,
}: PaymentResultClientProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | undefined>(initialOrderId);
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>();
  const [fiveMinutesElapsed, setFiveMinutesElapsed] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let finalOrderId = initialOrderId;

    if (!finalOrderId) {
      const urlOrderId = searchParams.get("id");
      if (urlOrderId) {
        finalOrderId = urlOrderId;
      }
    }

    if (!finalOrderId) {
      const storedOrderId = sessionStorage.getItem("pending_order_id");
      const storedPaymentId = sessionStorage.getItem("pending_payment_id");

      if (storedOrderId) {
        finalOrderId = storedOrderId;

        if (storedPaymentId) {
          setPaymentId(storedPaymentId);
        }

        sessionStorage.removeItem("pending_order_id");
        sessionStorage.removeItem("pending_payment_id");
      }
    }

    if (finalOrderId && finalOrderId !== orderId) {
      setOrderId(finalOrderId);
    }

    const cancelTimeout = setTimeout(() => {
      setFiveMinutesElapsed(true);
    }, CANCEL_AFTER_MS);

    return () => {
      clearTimeout(cancelTimeout);
    };
  }, [initialOrderId, searchParams]);

  const isExpiredOrCancelled =
    paymentStatus === "cancelled" || paymentStatus === "failed";
  const isStillPending = paymentStatus === "pending" || paymentStatus === "processing";
  const showCancelOption =
    isExpiredOrCancelled || (isStillPending && fiveMinutesElapsed);

  const handlePaymentStatusChange = (payment: Payment) => {
    setPaymentStatus(payment.status);
    if (payment.id) {
      setPaymentId(payment.id);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentId) {
      try {
        const { data: payment } = await paymentsApi.getPaymentByOrderId(
          orderId!,
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
      } catch {
        // Error finding payment
      }
      return;
    }

    await cancelPaymentById(paymentId);
  };

  const cancelPaymentById = async (id: string) => {
    try {
      setIsCancelling(true);
      const { error } = await paymentsApi.cancelPayment(id);

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
        onStatusChange={handlePaymentStatusChange}
      />

      {showCancelOption && isStillPending && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              {lang === "ar"
                ? "يمكنك إلغاء الدفع إذا لم تكتمل العملية."
                : "You can cancel the payment if you have not completed it."}
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={isCancelling}
              onClick={handleCancelPayment}
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {lang === "ar" ? "إلغاء الدفع" : "Cancel payment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
