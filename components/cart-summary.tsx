"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Minus,
  Plus,
  Edit,
  Trash2,
  MapPin,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addressesApi, Address } from "@/services/apiAddresses";
import { ordersApi, OrderItem } from "@/services/apiOrders";
import {
  calculateDeliveryFee,
  CalculateDeliveryFeeResult,
} from "@/services/apiDelivery";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface CartSummaryProps {
  lang: "en" | "ar";
  dict?: any;
}

export default function CartSummary({ lang, dict }: CartSummaryProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [showCartDetails, setShowCartDetails] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [orderNotes, setOrderNotes] = useState("");
  const [deliveryFeeData, setDeliveryFeeData] =
    useState<CalculateDeliveryFeeResult | null>(null);
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);

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
    staleTime: 30000, // 30 seconds
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

      // Check if address has coordinates
      if (!address.latitude || !address.longitude) {
        setDeliveryFeeError(
          lang === "ar"
            ? "هذا العنوان لا يحتوي على إحداثيات. يرجى تحديث العنوان."
            : "This address doesn't have coordinates. Please update the address."
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
        });
        setDeliveryFeeData(result);
        setDeliveryFeeError(null);
      } catch (error: any) {
        console.error("Error calculating delivery fee:", error);
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

    if (showCheckoutDialog) {
      calculateFee();
    }
  }, [selectedAddress, addresses, showCheckoutDialog, lang]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not logged in");

      // Prepare order items
      const orderItems: OrderItem[] = cart.map((item) => {
        // Extract original UUID from cart item ID
        // Cart IDs are in format: "uuid-timestamp", so we need to extract the UUID part
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 segments separated by hyphens)
        // We need to extract the first 5 segments (first 36 characters)
        const extractOriginalId = (cartId: string): string => {
          // Try to extract UUID pattern (36 characters with hyphens)
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
    onSuccess: () => {
      toast({
        title: dict?.cart?.orderPlaced || "Order Placed",
        description:
          dict?.cart?.orderPlacedMessage ||
          "Your order has been received successfully!",
      });
      clearCart();
      setShowCheckoutDialog(false);
      setOrderNotes("");
      // Navigate to profile/orders tab
      router.push(`/${lang}/profile?tab=orders`);
    },
    onError: (error: any) => {
      toast({
        title: dict?.cart?.orderFailed || "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const openCheckoutDialog = () => {
    if (cart.length === 0) return;

    if (!user) {
      // Redirect to sign in
      router.push(`/${lang}/auth/signin`);
      return;
    }

    setShowCheckoutDialog(true);
  };

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

  if (cart.length === 0) return null;

  const t = dict || {};

  return (
    <>
      {/* Cart Summary Fixed Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl border animate-bounce">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              {cart.length}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {t.cart?.itemsInCart ||
                  (lang === "ar" ? "عنصر في السلة" : "items in cart")}
              </div>
              <div className="text-gray-500 text-sm">
                {t.cart?.total || (lang === "ar" ? "الإجمالي:" : "Total:")} ج.م
                {getTotalPrice().toFixed(2)}
              </div>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={() => setShowCartDetails(true)}
                variant="outline"
                size="sm"
                className="px-3 py-2 rounded-xl"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={openCheckoutDialog}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                {t.cart?.placeOrder ||
                  (lang === "ar" ? "تأكيد الطلب" : "Place Order")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Details Dialog */}
      <Dialog open={showCartDetails} onOpenChange={setShowCartDetails}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {t.cart?.title ||
                (lang === "ar" ? "سلة التسوق" : "Shopping Cart")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 rtl:space-x-reverse p-4 border rounded-lg bg-gray-50"
              >
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={lang === "ar" ? item.title_ar : item.title_en}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {lang === "ar" ? item.title_ar : item.title_en}
                  </h4>

                  {item.type === "product" && item.sizeData && (
                    <div className="text-sm text-gray-600">
                      {lang === "ar"
                        ? item.sizeData.size_ar
                        : item.sizeData.size_en}
                      {item.variants && item.variants.length > 0 && (
                        <span> • {item.variants.join(", ")}</span>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md mt-2">
                      <span className="font-medium">
                        {lang === "ar" ? "ملاحظات:" : "Notes:"}
                      </span>{" "}
                      {item.notes}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    ج.م {(item.totalPrice / item.quantity).toFixed(2)}{" "}
                  </div>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-lg font-bold text-red-600">
                  ج.م {item.totalPrice.toFixed(2)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>
                  {t.cart?.total || (lang === "ar" ? "الإجمالي" : "Total")}
                </span>
                <span className="text-red-600">
                  ج.م {getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button
                onClick={() => setShowCartDetails(false)}
                variant="outline"
                className="flex-1"
              >
                {t.cart?.close || (lang === "ar" ? "إغلاق" : "Close")}
              </Button>
              <Button
                onClick={() => {
                  setShowCartDetails(false);
                  openCheckoutDialog();
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {t.cart?.continueOrder ||
                  (lang === "ar" ? "متابعة الطلب" : "Continue Order")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {t.cart?.deliveryInfo ||
                (lang === "ar" ? "معلومات التوصيل" : "Delivery Information")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info Display */}
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{user.full_name}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
              </div>
            )}

            {/* Address Selection */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">
                {t.cart?.selectDeliveryAddress ||
                  (lang === "ar"
                    ? "اختر عنوان التوصيل"
                    : "Select Delivery Address")}
              </Label>

              {loadingAddresses ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <p className="text-gray-500">
                      {t.common?.loading ||
                        (lang === "ar" ? "جاري التحميل..." : "Loading...")}
                    </p>
                  </div>
                </div>
              ) : addressesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{lang === "ar" ? "خطأ" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {lang === "ar"
                      ? "حدث خطأ أثناء تحميل العناوين. يرجى المحاولة مرة أخرى."
                      : "Failed to load addresses. Please try again."}
                  </AlertDescription>
                </Alert>
              ) : addresses && addresses.length > 0 ? (
                <Select
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        t.cart?.selectDeliveryAddress ||
                        (lang === "ar"
                          ? "اختر عنوان التوصيل"
                          : "Select Delivery Address")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <div className="font-semibold">{address.title}</div>
                            <div className="text-sm text-gray-500">
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
                    {t.cart?.noAddressesFound ||
                      (lang === "ar"
                        ? "لا توجد عناوين محفوظة"
                        : "No saved addresses found")}
                  </AlertTitle>
                  <AlertDescription>
                    {t.cart?.addAddressFirst ||
                      (lang === "ar"
                        ? "يرجى إضافة عنوان أولاً"
                        : "Please add an address first")}
                    <Link href={`/${lang}/profile/addresses/add`}>
                      <Button variant="link" className="px-0 ml-2">
                        {t.cart?.goToAddresses ||
                          (lang === "ar"
                            ? "إدارة العناوين"
                            : "Manage Addresses")}
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                {t.cart?.paymentMethod ||
                  (lang === "ar" ? "طريقة الدفع" : "Payment Method")}
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg bg-gray-50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label
                    htmlFor="cash"
                    className="text-base cursor-pointer flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {lang === "ar"
                          ? "الدفع نقداً عند الاستلام"
                          : "Cash on Delivery"}
                      </span>
                    </div>
                  </Label>
                </div>
                {/* More payment methods will be added here soon */}
                <div className="text-sm text-gray-500 text-center">
                  {lang === "ar"
                    ? "المزيد من طرق الدفع قريباً..."
                    : "More payment methods coming soon..."}
                </div>
              </RadioGroup>
            </div>

            {/* Delivery Fee Info */}
            {selectedAddress && (
              <div className="space-y-3">
                {loadingDeliveryFee ? (
                  <Alert className="bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <AlertTitle className="mb-0">
                        {lang === "ar"
                          ? "جاري حساب رسوم التوصيل..."
                          : "Calculating delivery fee..."}
                      </AlertTitle>
                    </div>
                  </Alert>
                ) : deliveryFeeError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      {lang === "ar"
                        ? "التوصيل غير متاح"
                        : "Delivery not available"}
                    </AlertTitle>
                    <AlertDescription>{deliveryFeeError}</AlertDescription>
                  </Alert>
                ) : deliveryFeeData ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      {lang === "ar" ? "التوصيل متاح" : "Delivery available"}
                    </AlertTitle>
                    <AlertDescription className="text-green-700 space-y-1">
                      <div>
                        <strong>
                          {lang === "ar" ? "الفرع الأقرب:" : "Nearest branch:"}
                        </strong>{" "}
                        {lang === "ar"
                          ? deliveryFeeData.nearest_branch.name_ar
                          : deliveryFeeData.nearest_branch.name_en}
                      </div>
                      <div>
                        <strong>
                          {lang === "ar" ? "المسافة:" : "Distance:"}
                        </strong>{" "}
                        {deliveryFeeData.distance_km.toFixed(2)}{" "}
                        {lang === "ar" ? "كم" : "km"}
                      </div>
                      <div>
                        <strong>
                          {lang === "ar" ? "رسوم التوصيل:" : "Delivery fee:"}
                        </strong>{" "}
                        {deliveryFeeData.fee.toFixed(2)}{" "}
                        {lang === "ar" ? "ج.م" : "EGP"}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}

            {/* Order Notes */}
            <div className="space-y-2">
              <Label htmlFor="orderNotes" className="text-lg font-semibold">
                {t.cart?.orderNotes ||
                  (lang === "ar" ? "ملاحظات الطلب" : "Order Notes")}
              </Label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={
                  t.cart?.orderNotesPlaceholder ||
                  (lang === "ar"
                    ? "أي ملاحظات خاصة للطلب؟"
                    : "Any special notes for your order?")
                }
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">
                {t.cart?.orderSummary ||
                  (lang === "ar" ? "ملخص الطلب" : "Order Summary")}
              </h3>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {lang === "ar" ? item.title_ar : item.title_en}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.type === "product" && item.sizeData
                          ? lang === "ar"
                            ? item.sizeData.size_ar
                            : item.sizeData.size_en
                          : ""}{" "}
                        x {item.quantity}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded mt-1">
                          <span className="font-medium">
                            {lang === "ar" ? "ملاحظات:" : "Notes:"}
                          </span>{" "}
                          {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold">
                      ج.م {item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 space-y-2">
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600">
                      {t.cart?.subtotal ||
                        (lang === "ar" ? "المجموع الفرعي" : "Subtotal")}
                    </span>
                    <span className="font-semibold">
                      ج.م {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600">
                      {t.cart?.deliveryFee ||
                        (lang === "ar" ? "رسوم التوصيل" : "Delivery Fee")}
                    </span>
                    <span className="font-semibold">
                      {loadingDeliveryFee ? (
                        <span className="text-gray-400">
                          {lang === "ar" ? "جاري الحساب..." : "Calculating..."}
                        </span>
                      ) : deliveryFeeData ? (
                        `ج.م ${deliveryFeeData.fee.toFixed(2)}`
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>
                      {t.cart?.total || (lang === "ar" ? "الإجمالي" : "Total")}
                    </span>
                    <span className="text-red-600">
                      ج.م{" "}
                      {(getTotalPrice() + (deliveryFeeData?.fee || 0)).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={
                createOrderMutation.isPending ||
                !addresses ||
                addresses.length === 0 ||
                !selectedAddress ||
                loadingDeliveryFee ||
                !!deliveryFeeError ||
                !deliveryFeeData
              }
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrderMutation.isPending
                ? lang === "ar"
                  ? "جاري التأكيد..."
                  : "Placing Order..."
                : loadingDeliveryFee
                ? lang === "ar"
                  ? "جاري حساب التوصيل..."
                  : "Calculating delivery..."
                : t.cart?.placeOrder ||
                  (lang === "ar" ? "تأكيد الطلب" : "Place Order")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
