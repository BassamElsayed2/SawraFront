"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PaymentButton from "./payment-button";
import { ordersApi, CreateOrderData } from "@/services/apiOrders";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Smartphone, Wallet } from "lucide-react";

interface CheckoutWithPaymentProps {
  orderData: CreateOrderData;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (orderId: string) => void;
}

export default function CheckoutWithPayment({
  orderData,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
}: CheckoutWithPaymentProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateOrderForPayment = async () => {
    try {
      setIsCreatingOrder(true);

      // Create order with EasyKash payment method
      const { data, error } = await ordersApi.createOrder({
        ...orderData,
        payment_method: "easykash",
      });

      if (error || !data?.order) {
        throw new Error(error?.message || "Failed to create order");
      }

      setCreatedOrderId(data.order.id);
      return data.order.id;
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Secure online payment via EasyKash</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* EasyKash Payment Options */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Available Payment Methods
          </Label>

          {/* Payment Options Display */}
          <div className="grid grid-cols-1 gap-3">
            {/* Credit/Debit Cards */}
            <div className="flex items-center space-x-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <CreditCard className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  Credit & Debit Cards
                </div>
                <div className="text-xs text-muted-foreground">
                  Visa, Mastercard, Amex
                </div>
              </div>
            </div>

            {/* Mobile Wallets */}
            <div className="flex items-center space-x-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <Smartphone className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Mobile Wallets</div>
                <div className="text-xs text-muted-foreground">
                  Apple Pay, Google Pay, Samsung Pay
                </div>
              </div>
            </div>

            {/* Digital Wallets */}
            <div className="flex items-center space-x-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <Wallet className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="font-semibold text-sm">Digital Wallets</div>
                <div className="text-xs text-muted-foreground">
                  PayPal, Skrill, and more
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              🔒 All transactions are secured and encrypted by EasyKash
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Total Amount:</span>
            <span className="font-bold text-lg">
              {orderData.total.toLocaleString()} EGP
            </span>
          </div>

          {createdOrderId ? (
            <PaymentButton
              orderId={createdOrderId}
              amount={orderData.total}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
            />
          ) : (
            <Button
              onClick={handleCreateOrderForPayment}
              disabled={isCreatingOrder}
              className="w-full"
              size="lg"
            >
              {isCreatingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By placing your order, you agree to our terms and conditions
        </p>
      </CardContent>
    </Card>
  );
}
