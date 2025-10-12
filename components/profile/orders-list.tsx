"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, Order } from "@/services/apiOrders";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface OrdersListProps {
  lang: string;
  t: any;
}

export function OrdersList({ lang, t }: OrdersListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () =>
      user ? ordersApi.getOrders(user.id).then((res) => res.data || []) : [],
    enabled: !!user,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      toast({
        title: lang === "ar" ? "تم إلغاء الطلب" : "Order Cancelled",
        description:
          lang === "ar"
            ? "تم إلغاء الطلب بنجاح"
            : "Order has been cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من إلغاء هذا الطلب؟"
          : "Are you sure you want to cancel this order?"
      )
    ) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "ready":
      case "delivering":
        return <ShoppingBag className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-orange-100 text-orange-800";
      case "delivering":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.common?.loading || "Loading..."}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          {t.orders?.noOrders ||
            (lang === "ar" ? "لا توجد طلبات" : "No orders yet")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {t.orders?.orderNumber || "Order"} #{order.id.slice(0, 8)}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(order.created_at), "PPP")}</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`flex items-center gap-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span>
                    {t.orders?.status?.[order.status] || order.status}
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-600">
                {lang === "ar" ? "المنتجات:" : "Items:"}
              </h4>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex-1">
                    <span className="font-medium">
                      {lang === "ar" ? item.title_ar : item.title_en}
                    </span>
                    {item.size && (
                      <span className="text-gray-500 ms-2">({item.size})</span>
                    )}
                    <span className="text-gray-500 ms-2">
                      x {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">
                    ج.م {item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {order.delivery_type === "delivery" ? (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>
                      {lang === "ar" ? "توصيل للمنزل" : "Home Delivery"}
                    </span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      {lang === "ar" ? "استلام من الفرع" : "Pickup from Branch"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <span className="font-semibold text-blue-900">
                  {lang === "ar" ? "ملاحظات:" : "Notes:"}
                </span>{" "}
                <span className="text-blue-700">{order.notes}</span>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {t.orders?.orderTotal ||
                    (lang === "ar" ? "الإجمالي:" : "Total:")}
                </span>
                <span className="text-xl font-bold text-red-600">
                  ج.م {order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {order.status === "pending" && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={cancelOrderMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  {t.orders?.cancelOrder ||
                    (lang === "ar" ? "إلغاء الطلب" : "Cancel Order")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
