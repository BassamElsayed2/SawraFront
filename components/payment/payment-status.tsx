"use client";

import { useEffect, useState } from "react";
import { paymentsApi, Payment } from "@/services/apiPayments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

interface PaymentStatusProps {
  paymentId?: string;
  orderId?: string;
  showOrderLink?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  lang?: "en" | "ar";
}

export default function PaymentStatus({
  paymentId,
  orderId,
  showOrderLink = true,
  autoRefresh = true,
  refreshInterval = 3000,
  lang = "en",
}: PaymentStatusProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [cartCleared, setCartCleared] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchPaymentStatus = async () => {
      try {
        let result;

        if (paymentId) {
          result = await paymentsApi.getPaymentStatus(paymentId);
        } else if (orderId) {
          result = await paymentsApi.getPaymentByOrderId(orderId);
        } else {
          throw new Error("Payment ID or Order ID is required");
        }

        const { data, error: apiError } = result;

        if (apiError || !data) {
          throw new Error(
            apiError?.message || "Failed to fetch payment status"
          );
        }

        setPayment(data);
        setError(null);

        // Clear cart if payment is completed (only once)
        if (!cartCleared && data.status === "completed") {
          setCartCleared(true);
          clearCart();
        }

        // Cancel order if payment failed or cancelled (only once)
        if (
          !orderCancelled &&
          data.status &&
          ["failed", "cancelled"].includes(data.status) &&
          data.order_id
        ) {
          setOrderCancelled(true);
          try {
            // Import ordersApi dynamically to avoid circular dependency
            const { ordersApi } = await import("@/services/apiOrders");
            await ordersApi.cancelOrder(data.order_id);
          } catch (cancelError) {
            // Failed to auto-cancel order
          }
        }

        // Stop auto-refresh if payment is in a final state
        if (
          autoRefresh &&
          data.status &&
          ["completed", "failed", "cancelled", "refunded"].includes(data.status)
        ) {
          clearInterval(intervalId);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();

    if (autoRefresh) {
      intervalId = setInterval(fetchPaymentStatus, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId, orderId, autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-12 w-12 text-red-500" />;
      case "pending":
      case "processing":
        return <Clock className="h-12 w-12 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      completed: "default",
      failed: "destructive",
      cancelled: "secondary",
      pending: "outline",
      processing: "outline",
      refunded: "secondary",
    };

    return (
      <Badge variant={variants[status] || "default"} className="text-sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusMessage = (status: string, isArabic: boolean = false) => {
    switch (status) {
      case "completed":
        return isArabic
          ? "تم معالجة الدفع بنجاح!"
          : "Your payment has been processed successfully!";
      case "failed":
        return isArabic
          ? "فشل الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم على 17533"
          : "Payment failed. Please try again or contact support at 17533";
      case "cancelled":
        return isArabic ? "تم إلغاء الدفع." : "Payment was cancelled.";
      case "pending":
        return isArabic
          ? "الدفع لم يكتمل. إذا استمرت المشكلة، يرجى التواصل مع الدعم على 17533"
          : "Payment is incomplete. If the issue persists, please contact support at 17533";
      case "processing":
        return isArabic ? "جاري معالجة الدفع..." : "Processing your payment...";
      case "refunded":
        return isArabic
          ? "تم استرداد المبلغ المدفوع."
          : "Payment has been refunded.";
      default:
        return isArabic ? "حالة الدفع غير معروفة" : "Unknown payment status";
    }
  };

  // Create WhatsApp message and link
  const createWhatsAppMessage = () => {
    if (!payment || !user) return "";

    const orderShortId = payment.order_id?.substring(0, 6) || "N/A";
    const customerName = user.full_name;
    const amount = payment.amount.toLocaleString();
    const currency = payment.currency;

    const message =
      lang === "ar"
        ? `مرحباً،\n\nتم إتمام الدفع بنجاح للطلب:\n\n🔖 رقم الطلب: ${orderShortId}\n👤 اسم العميل: ${customerName}\n💰 المبلغ: ${amount} ${currency}\n\nشكراً لك.`
        : `Hello,\n\nPayment completed successfully for order:\n\n🔖 Order ID: ${orderShortId}\n👤 Customer Name: ${customerName}\n💰 Amount: ${amount} ${currency}\n\nThank you.`;

    return message;
  };

  const handleSendToWhatsApp = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
      return;
    }

    const message = createWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "جاري تحميل حالة الدفع..."
                : "Loading payment status..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={() => router.push("/orders")}>
              {lang === "ar" ? "عرض الطلبات" : "View Orders"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {lang === "ar" ? "حالة الدفع" : "Payment Status"}
        </CardTitle>
        <CardDescription className="text-center">
          {lang === "ar" ? "رقم المعاملة: " : "Transaction ID: "}
          {payment.transaction_id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {getStatusIcon(payment.status)}
          {getStatusBadge(payment.status)}
          <p className="text-center text-sm text-muted-foreground">
            {getStatusMessage(payment.status, lang === "ar")}
          </p>
        </div>

        {/* Support contact info for pending/failed payments */}
        {(payment.status === "pending" || payment.status === "failed") && (
          <div
            className={`bg-yellow-50 dark:bg-yellow-900/20 border ${
              payment.status === "failed"
                ? "border-red-200 dark:border-red-800"
                : "border-yellow-200 dark:border-yellow-800"
            } rounded-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`h-5 w-5 ${
                  payment.status === "failed"
                    ? "text-red-500"
                    : "text-yellow-500"
                } mt-0.5 flex-shrink-0`}
              />
              <div className="flex-1 space-y-1">
                <p
                  className={`text-sm font-medium ${
                    payment.status === "failed"
                      ? "text-red-900 dark:text-red-100"
                      : "text-yellow-900 dark:text-yellow-100"
                  }`}
                >
                  {lang === "ar"
                    ? payment.status === "pending"
                      ? "لم يكتمل الدفع"
                      : "فشل الدفع"
                    : payment.status === "pending"
                    ? "Payment Incomplete"
                    : "Payment Failed"}
                </p>
                <p
                  className={`text-xs ${
                    payment.status === "failed"
                      ? "text-red-700 dark:text-red-200"
                      : "text-yellow-700 dark:text-yellow-200"
                  }`}
                >
                  {lang === "ar"
                    ? "في حالة حدوث خطأ أو استمرار المشكلة، يرجى التواصل مع خدمة العملاء على الرقم:"
                    : "If an error occurred or the issue persists, please contact customer support at:"}
                </p>
                <p
                  className={`text-lg font-bold ${
                    payment.status === "failed"
                      ? "text-red-900 dark:text-red-100"
                      : "text-yellow-900 dark:text-yellow-100"
                  } tracking-wide`}
                  dir="ltr"
                >
                  17533
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {lang === "ar" ? "المبلغ:" : "Amount:"}
            </span>
            <span className="font-medium">
              {payment.amount.toLocaleString()} {payment.currency}
            </span>
          </div>
          {payment.reference_number && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {lang === "ar" ? "المرجع:" : "Reference:"}
              </span>
              <span className="font-medium">{payment.reference_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {lang === "ar" ? "المزود:" : "Provider:"}
            </span>
            <span className="font-medium capitalize">{payment.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {lang === "ar" ? "التاريخ:" : "Date:"}
            </span>
            <span className="font-medium">
              {new Date(payment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* WhatsApp Button for completed payments */}
        {payment.status === "completed" && user && (
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={handleSendToWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {lang === "ar"
                ? "أرسل الطلب عبر الواتس لضمان سرعة الاستجابة"
                : "Send Order via WhatsApp for Fast Response"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
