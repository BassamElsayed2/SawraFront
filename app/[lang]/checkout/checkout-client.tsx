"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Minus,
  Plus,
  Trash2,
  MapPin,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/lib/image-url";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addressesApi, Address } from "@/services/apiAddresses";
import { ordersApi, OrderItem } from "@/services/apiOrders";
import {
  calculateDeliveryFee,
  CalculateDeliveryFeeResult,
} from "@/services/apiDelivery";
import { paymentsApi } from "@/services/apiPayments";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PhoneRequiredModal } from "@/components/checkout/phone-required-modal";

interface CheckoutClientProps {
  lang: "en" | "ar";
  dict?: any;
}

export default function CheckoutClient({ lang, dict }: CheckoutClientProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod] = useState<string>("easykash");
  const [orderNotes, setOrderNotes] = useState("");
  const [deliveryFeeData, setDeliveryFeeData] =
    useState<CalculateDeliveryFeeResult | null>(null);
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push(`/${lang}/auth/signin?redirect=/${lang}/checkout`);
    }
  }, [user, lang, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && user) {
      toast({
        title: lang === "ar" ? "السلة فارغة" : "Cart is empty",
        description:
          lang === "ar"
            ? "يرجى إضافة منتجات إلى السلة أولاً"
            : "Please add products to cart first",
        variant: "destructive",
      });
      router.push(`/${lang}/menu`);
    }
  }, [cart.length, lang, router, user, toast]);

  // Fetch user addresses
  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    isError: addressesError,
  } = useQuery<Address[]>({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await addressesApi.getAddresses();
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000,
  });

  // Auto-select default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else {
        setSelectedAddress(addresses[0].id);
      }
    }
  }, [addresses]);

  // Calculate delivery fee when address changes
  useEffect(() => {
    const calculateFee = async () => {
      if (!selectedAddress || !addresses || addresses.length === 0) {
        setDeliveryFeeData(null);
        return;
      }

      const address = addresses.find((addr) => addr.id === selectedAddress);
      if (!address) {
        setDeliveryFeeData(null);
        return;
      }

      if (!address.latitude || !address.longitude) {
        setDeliveryFeeError(
          lang === "ar"
            ? "هذا العنوان لا يحتوي على إحداثيات. يرجى تحديث العنوان."
            : "This address doesn't have coordinates. Please update the address."
        );
        setDeliveryFeeData(null);
        return;
      }

      // Get selected branch from cart (all items should have same branch_id)
      const selectedBranchId = cart.length > 0 ? cart[0].branch_id : undefined;

      if (!selectedBranchId) {
        setDeliveryFeeError(
          lang === "ar"
            ? "لم يتم تحديد الفرع. يرجى اختيار فرع من المنيو."
            : "No branch selected. Please select a branch from menu."
        );
        setDeliveryFeeData(null);
        return;
      }

      setLoadingDeliveryFee(true);
      setDeliveryFeeError(null);

      try {
        const result = await calculateDeliveryFee({
          user_latitude: address.latitude,
          user_longitude: address.longitude,
          branch_id: selectedBranchId,
        });
        setDeliveryFeeData(result);
        setDeliveryFeeError(null);
      } catch (error: any) {
        setDeliveryFeeError(
          error.message ||
            (lang === "ar"
              ? "عذراً، التوصيل غير متاح لهذا العنوان"
              : "Sorry, delivery is not available for this address")
        );
        setDeliveryFeeData(null);
      } finally {
        setLoadingDeliveryFee(false);
      }
    };

    calculateFee();
  }, [selectedAddress, addresses, lang, cart]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not logged in");

      const orderItems: OrderItem[] = cart.map((item) => {
        const extractOriginalId = (cartId: string): string => {
          const uuidMatch = cartId.match(
            /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
          );
          return uuidMatch ? uuidMatch[1] : cartId;
        };

        const originalId = extractOriginalId(item.id);
        const productId = item.type === "product" ? originalId : undefined;
        const offerId = item.type === "offer" ? originalId : undefined;

        return {
          product_id: productId,
          offer_id: offerId,
          type: item.type,
          title_ar: item.title_ar,
          title_en: item.title_en,
          quantity: item.quantity,
          price_per_unit: item.totalPrice / item.quantity,
          total_price: item.totalPrice,
          size: item.size,
          size_data: item.sizeData,
          variants: item.variants,
          notes: item.notes,
        };
      });

      const subtotal = getTotalPrice();
      const deliveryFee = deliveryFeeData?.fee || 0;
      const total = subtotal + deliveryFee;

      const orderData = {
        address_id: selectedAddress,
        delivery_type: "delivery" as const,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        notes: orderNotes,
        payment_method: paymentMethod,
      };

      const { data, error } = await ordersApi.createOrder(orderData);
      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      const order = data?.order;

      try {
        setIsInitiatingPayment(true);

        if (!order) {
          throw new Error("Order data not found");
        }

        const paymentResult = await paymentsApi.initiatePayment({
          order_id: order.id,
          amount: order.total,
          customer_name: user?.full_name || user?.email || "Customer",
          customer_email: user?.email,
          customer_phone: user?.phone,
          currency: "EGP",
        });

        if (paymentResult.error || !paymentResult.data) {
          throw new Error(
            paymentResult.error?.message || "Failed to initiate payment"
          );
        }

        sessionStorage.setItem(
          "pending_payment_id",
          paymentResult.data.paymentId
        );
        sessionStorage.setItem("pending_order_id", order.id);

        setOrderNotes("");

        window.location.href = paymentResult.data.paymentUrl;
      } catch (error: any) {
        try {
          if (order?.id) {
            await ordersApi.cancelOrder(order.id);
          }
        } catch (cancelError) {
          // Failed to cancel order
        }

        toast({
          title: lang === "ar" ? "فشل بدء الدفع" : "Payment Failed",
          description:
            error.message ||
            (lang === "ar"
              ? "فشل في بدء عملية الدفع. لم يتم إنشاء الطلب."
              : "Failed to initiate payment. Order was not created."),
          variant: "destructive",
        });

        setIsInitiatingPayment(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: dict?.cart?.orderFailed || "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!user) {
      toast({
        title: dict?.cart?.loginRequired || "Login Required",
        description:
          dict?.cart?.loginRequiredMessage ||
          "You must be logged in to place an order",
        variant: "destructive",
      });
      return;
    }

    // ✅ Check if user has phone number
    if (!user.phone) {
      setShowPhoneModal(true);
      return;
    }

    if (!selectedAddress) {
      toast({
        title: dict?.cart?.pleaseSelectAddress || "Please select an address",
        variant: "destructive",
      });
      return;
    }

    if (deliveryFeeError) {
      toast({
        title: dict?.cart?.deliveryNotAvailable || "Delivery not available",
        description: deliveryFeeError,
        variant: "destructive",
      });
      return;
    }

    if (!deliveryFeeData) {
      toast({
        title:
          dict?.cart?.calculatingDeliveryFee || "Calculating delivery fee...",
        description:
          dict?.cart?.pleaseWait ||
          "Please wait while we calculate the delivery fee",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  if (!user || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const BackButton = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <Link href={`/${lang}/menu`}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 sm:mb-4 -ms-2 sm:ms-0 hover:bg-white/60 transition-colors text-sm sm:text-base"
            >
              <BackButton className="h-4 w-4 me-2" />
              {lang === "ar" ? "العودة للقائمة" : "Back to Menu"}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex flex-wrap items-center gap-2 sm:gap-3 text-gray-900">
            <ShoppingCart className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 text-red-600" />
            <span className="leading-tight">
              {lang === "ar" ? "إتمام الطلب" : "Checkout"}
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 sm:gap-8">
          {/* Left Side - Order Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-red-600" />
                {lang === "ar" ? "عناصر الطلب" : "Order Items"}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-red-200 transition-all bg-white"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <div className="absolute -top-1.5 -start-1.5 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg z-10">
                          {index + 1}
                        </div>
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={lang === "ar" ? item.title_ar : item.title_en}
                          width={110}
                          height={110}
                          sizes="(max-width: 640px) 80px, 110px"
                          className="w-20 h-20 sm:w-[110px] sm:h-[110px] rounded-lg sm:rounded-xl object-cover border border-gray-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-gray-900 break-words">
                          {lang === "ar" ? item.title_ar : item.title_en}
                        </h4>

                        {item.type === "product" && item.sizeData && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              {lang === "ar"
                                ? item.sizeData.size_ar
                                : item.sizeData.size_en}
                            </Badge>
                            {item.variants && item.variants.length > 0 && (
                              <span className="text-xs text-gray-500">
                                • {item.variants.join(", ")}
                              </span>
                            )}
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded-lg mb-2">
                            <span className="font-semibold text-gray-900">
                              {lang === "ar" ? "ملاحظات:" : "Notes:"}
                            </span>{" "}
                            {item.notes}
                          </div>
                        )}

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 w-fit max-w-full">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 touch-manipulation hover:bg-red-50 hover:text-red-600 transition-colors"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <span className="min-w-[2.5rem] text-center font-bold text-base sm:text-lg text-gray-900 tabular-nums">
                              {item.quantity}
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 touch-manipulation hover:bg-red-50 hover:text-red-600 transition-colors"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3 min-w-0">
                            <span className="text-lg sm:text-xl font-bold text-red-600 tabular-nums whitespace-nowrap">
                              {item.totalPrice.toFixed(2)} ج.م
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 shrink-0 touch-manipulation hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Customer Details */}
          <div className="space-y-6">
            {/* User Info */}
            {user && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900">
                  <User className="h-5 w-5 shrink-0 text-red-600" />
                  {lang === "ar" ? "معلومات العميل" : "Customer Information"}
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-gray-50 p-3 rounded-lg sm:rounded-xl border border-gray-200">
                    <User className="h-5 w-5 shrink-0 text-gray-600 mt-0.5 sm:mt-0" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {user.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-3 rounded-lg sm:rounded-xl border border-gray-200">
                    <Phone className="h-5 w-5 shrink-0 text-gray-600" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                      {user.phone}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Selection */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <MapPin className="h-5 w-5 shrink-0 text-red-600" />
                <Label className="text-lg sm:text-xl font-bold text-gray-900">
                  {lang === "ar" ? "عنوان التوصيل" : "Delivery Address"}
                </Label>
              </div>

              {loadingAddresses ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : addressesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{lang === "ar" ? "خطأ" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {lang === "ar"
                      ? "حدث خطأ أثناء تحميل العناوين"
                      : "Failed to load addresses"}
                  </AlertDescription>
                </Alert>
              ) : addresses && addresses.length > 0 ? (
                <Select
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                >
                  <SelectTrigger className="w-full min-h-[2.75rem] text-sm sm:text-base text-start py-2.5 h-auto [&>span]:line-clamp-2 sm:[&>span]:line-clamp-1 [&>span]:text-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(24rem,70dvh)] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1.5rem)]">
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        <div className="flex items-start gap-2 py-0.5">
                          <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                          <div className="min-w-0 text-start">
                            <div className="font-semibold text-sm sm:text-base break-words">
                              {address.title}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 break-words">
                              {address.street}, {address.area}, {address.city}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {lang === "ar" ? "لا توجد عناوين" : "No addresses found"}
                  </AlertTitle>
                  <AlertDescription>
                    <Link href={`/${lang}/profile/addresses/add`}>
                      <Button variant="link" className="px-0">
                        {lang === "ar" ? "إضافة عنوان" : "Add Address"}
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Delivery Fee */}
            {selectedAddress && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                {loadingDeliveryFee ? (
                  <Alert className="bg-gray-50 border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      <AlertTitle className="mb-0 text-gray-900">
                        {lang === "ar"
                          ? "جاري حساب رسوم التوصيل..."
                          : "Calculating delivery fee..."}
                      </AlertTitle>
                    </div>
                  </Alert>
                ) : deliveryFeeError ? (
                  <Alert
                    variant="destructive"
                    className="border-red-300 bg-red-50"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-800">
                      {lang === "ar"
                        ? "التوصيل غير متاح"
                        : "Delivery not available"}
                    </AlertTitle>
                    <AlertDescription className="text-red-700">
                      {deliveryFeeError}
                    </AlertDescription>
                  </Alert>
                ) : deliveryFeeData ? (
                  <Alert className="bg-red-50 border-red-200">
                    <CheckCircle2 className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-900 font-bold">
                      {lang === "ar" ? "التوصيل متاح!" : "Delivery available!"}
                    </AlertTitle>
                    <AlertDescription className="text-gray-700 space-y-2 sm:space-y-2 mt-2 text-sm sm:text-base">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-2">
                        <span className="font-semibold text-gray-900 shrink-0">
                          {lang === "ar" ? "الفرع:" : "Branch:"}
                        </span>
                        <span className="text-gray-800 text-start sm:text-end break-words">
                          {lang === "ar"
                            ? deliveryFeeData.nearest_branch.name_ar
                            : deliveryFeeData.nearest_branch.name_en}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center sm:gap-2">
                        <span className="font-semibold text-gray-900 shrink-0">
                          {lang === "ar" ? "المسافة:" : "Distance:"}
                        </span>
                        <span className="text-gray-800 tabular-nums">
                          {deliveryFeeData.distance_km.toFixed(2)}{" "}
                          {lang === "ar" ? "كم" : "km"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center font-bold text-base sm:text-lg border-t border-red-200 pt-2 gap-y-1">
                        <span className="text-gray-900">
                          {lang === "ar" ? "رسوم التوصيل:" : "Delivery fee:"}
                        </span>
                        <span className="text-red-600 tabular-nums">
                          {deliveryFeeData.fee.toFixed(2)}{" "}
                          {lang === "ar" ? "ج.م" : "EGP"}
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}

            {/* Order Notes */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <Label
                htmlFor="orderNotes"
                className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 block text-gray-900"
              >
                {lang === "ar" ? "ملاحظات الطلب" : "Order Notes"}
                <span className="text-xs sm:text-sm font-normal text-gray-500 ms-2">
                  ({lang === "ar" ? "اختياري" : "Optional"})
                </span>
              </Label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "أي ملاحظات خاصة للطلب؟"
                    : "Any special notes for your order?"
                }
                rows={4}
                className="resize-none min-h-[100px] text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-200 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900">
                <ShoppingCart className="h-5 w-5 shrink-0 text-red-600" />
                {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start gap-3 text-base sm:text-lg">
                  <span className="text-gray-700 shrink-0">
                    {lang === "ar" ? "المجموع الفرعي:" : "Subtotal:"}
                  </span>
                  <span className="font-bold text-gray-900 tabular-nums text-end">
                    {getTotalPrice().toFixed(2)} ج.م
                  </span>
                </div>

                <div className="flex justify-between items-start gap-3 text-base sm:text-lg">
                  <span className="text-gray-700 shrink-0">
                    {lang === "ar" ? "رسوم التوصيل:" : "Delivery Fee:"}
                  </span>
                  <span className="font-bold text-gray-900 tabular-nums text-end">
                    {loadingDeliveryFee ? (
                      <span className="text-xs sm:text-sm text-gray-500">
                        {lang === "ar" ? "جاري الحساب..." : "Calculating..."}
                      </span>
                    ) : deliveryFeeData ? (
                      `${deliveryFeeData.fee.toFixed(2)} ج.م`
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </span>
                </div>

                <div className="border-t-2 border-red-200 pt-3 sm:pt-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {lang === "ar" ? "الإجمالي:" : "Total:"}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-red-600 tabular-nums">
                    {(getTotalPrice() + (deliveryFeeData?.fee || 0)).toFixed(2)}{" "}
                    ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={
                createOrderMutation.isPending ||
                isInitiatingPayment ||
                !addresses ||
                addresses.length === 0 ||
                !selectedAddress ||
                loadingDeliveryFee ||
                !!deliveryFeeError ||
                !deliveryFeeData
              }
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 sm:py-7 min-h-[52px] text-base sm:text-xl rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation"
            >
              {isInitiatingPayment ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {lang === "ar"
                    ? "جاري التحويل للدفع..."
                    : "Redirecting to payment..."}
                </span>
              ) : createOrderMutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {lang === "ar" ? "جاري إنشاء الطلب..." : "Creating order..."}
                </span>
              ) : loadingDeliveryFee ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {lang === "ar"
                    ? "جاري حساب التوصيل..."
                    : "Calculating delivery..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  {lang === "ar" ? "الدفع الآن" : "Pay Now"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Phone Required Modal */}
      <PhoneRequiredModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={() => {
          setShowPhoneModal(false);
          // Retry the order after phone is added
          handlePlaceOrder();
        }}
        lang={lang}
      />
    </div>
  );
}
