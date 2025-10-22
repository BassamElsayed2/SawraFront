"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { paymentsApi } from "@/services/apiPayments";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  currency?: string;
  disabled?: boolean;
  className?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentButton({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  currency = "EGP",
  disabled = false,
  className = "",
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Initiate payment
      const { data, error } = await paymentsApi.initiatePayment({
        order_id: orderId,
        amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        currency,
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to initiate payment");
      }

      // Redirect to payment URL
      if (data.paymentUrl) {
        // Store payment ID in sessionStorage for callback handling
        sessionStorage.setItem("pending_payment_id", data.paymentId);
        sessionStorage.setItem("pending_order_id", orderId);

        // Redirect to EasyKash payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }

      if (onSuccess) {
        onSuccess(data.paymentId);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });

      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`w-full ${className}`}
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay with EasyKash
        </>
      )}
    </Button>
  );
}
