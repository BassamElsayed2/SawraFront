"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  Minus,
  Plus,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Edit,
  Trash2,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/apiBranches";

interface CartSummaryProps {
  lang: "en" | "ar";
}

export default function CartSummary({ lang }: CartSummaryProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  const openCustomerDialog = () => {
    if (cart.length === 0) return;
    setShowCustomerDialog(true);
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;

    try {
      // Build order text with better formatting
      const orderLines = cart.map((item, index) => {
        const title = lang === "ar" ? item.title_ar : item.title_en;
        let details = "";

        if (item.type === "product" && item.sizeData) {
          const sizeName =
            lang === "ar" ? item.sizeData.size_ar : item.sizeData.size_en;
          details = ` - ${sizeName}`;
          if (item.variants && item.variants.length > 0) {
            details += ` (${item.variants.join(", ")})`;
          }
        }

        let orderLine = `${title}${details}\n   الكمية: ${
          item.quantity
        } × ج.م ${(item.totalPrice / item.quantity).toFixed(
          2
        )} = ج.م ${item.totalPrice.toFixed(2)}`;

        // Add notes if available
        if (item.notes && item.notes.trim()) {
          orderLine += `\n   📝 ملاحظات: ${item.notes}`;
        }

        return orderLine;
      });

      const total = getTotalPrice();

      // Build message parts with better formatting
      const parts = [
        `🍕 *طلب جديد*`,
        ``,
        `👤 *معلومات العميل:*`,
        `الاسم: ${customerName}`,
        `الهاتف: ${customerPhone}`,
        ``,
      ];

      // Add delivery info
      if (deliveryType === "delivery") {
        parts.push(`🚚 *نوع التوصيل:* توصيل للمنزل`);
        parts.push(`📍 *العنوان:* ${customerAddress}`);
      } else {
        const selectedBranchData = branches.find(
          (b) => b.id.toString() === selectedBranch
        );
        parts.push(`🏪 *نوع التوصيل:* استلام من الفرع`);
        if (selectedBranchData) {
          const branchName =
            lang === "ar"
              ? selectedBranchData.name_ar
              : selectedBranchData.name_en;
          parts.push(`🏪 *الفرع:* ${branchName}`);
        }
      }

      // Add order details
      parts.push(``);
      parts.push(`📋 *تفاصيل الطلب:*`);
      parts.push(...orderLines);
      parts.push(``);
      parts.push(`💰 *الإجمالي:* ج.م ${total.toFixed(2)}`);

      const message = parts.join("\n");

      // Create WhatsApp URL with proper encoding for Business accounts
      const encodedMessage = encodeURIComponent(message);

      // Detect if user is on mobile
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Choose URL based on device
      let whatsappUrl;
      if (isMobile) {
        // On mobile, use wa.me (opens WhatsApp app directly)
        whatsappUrl = `https://wa.me/201557466759?text=${encodedMessage}`;
      } else {
        // On desktop, use web.whatsapp.com (since it worked)
        whatsappUrl = `https://web.whatsapp.com/send?phone=201557466759&text=${encodedMessage}`;
      }

      // Always send detailed message regardless of length
      window.open(whatsappUrl, "_blank");

      setShowCustomerDialog(false);

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setDeliveryType("delivery");
      setSelectedBranch("");
      clearCart();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      // Fallback: very simple message
      const fallbackMessage = `طلب جديد من ${customerName} - ${customerPhone}`;
      // Use wa.me for fallback (works on both mobile and desktop)
      const fallbackUrl = `https://wa.me/201557466759?text=${encodeURIComponent(
        fallbackMessage
      )}`;
      window.open(fallbackUrl, "_blank");
    }
  };

  if (cart.length === 0) return null;

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
                {lang === "ar" ? "عنصر في السلة" : "items in cart"}
              </div>
              <div className="text-gray-500 text-sm">
                {lang === "ar" ? "الإجمالي:" : "Total:"} ج.م
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
                onClick={openCustomerDialog}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                {lang === "ar" ? "إرسال عبر واتساب" : "Send via WhatsApp"}
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
              {lang === "ar" ? "سلة التسوق" : "Shopping Cart"}
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
                <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
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
                {lang === "ar" ? "إغلاق" : "Close"}
              </Button>
              <Button
                onClick={() => {
                  setShowCartDetails(false);
                  openCustomerDialog();
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {lang === "ar" ? "متابعة الطلب" : "Continue Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Info Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {lang === "ar" ? "معلومات التوصيل" : "Delivery Information"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-lg font-semibold">
                {lang === "ar" ? "الاسم الكامل" : "Full Name"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={
                    lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-lg font-semibold">
                {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={
                    lang === "ar" ? "أدخل رقم هاتفك" : "Enter your phone number"
                  }
                  className="pl-10"
                  type="tel"
                  required
                />
              </div>
            </div>

            {/* Delivery Type */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                {lang === "ar" ? "نوع التوصيل" : "Delivery Type"}
              </Label>
              <RadioGroup
                value={deliveryType}
                onValueChange={(value) =>
                  setDeliveryType(value as "delivery" | "pickup")
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label
                    htmlFor="delivery"
                    className="text-base cursor-pointer"
                  >
                    {lang === "ar" ? "توصيل للمنزل" : "Home Delivery"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="text-base cursor-pointer">
                    {lang === "ar" ? "استلام من الفرع" : "Pickup from Branch"}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Address (for delivery) */}
            {deliveryType === "delivery" && (
              <div className="space-y-2">
                <Label
                  htmlFor="customerAddress"
                  className="text-lg font-semibold"
                >
                  {lang === "ar" ? "عنوان التوصيل" : "Delivery Address"}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={
                      lang === "ar"
                        ? "أدخل عنوان التوصيل"
                        : "Enter delivery address"
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Branch Selection (for pickup) */}
            {deliveryType === "pickup" && (
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-lg font-semibold">
                  {lang === "ar" ? "اختر الفرع" : "Select Branch"}
                </Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        lang === "ar" ? "اختر الفرع" : "Select a branch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {lang === "ar" ? branch.name_ar : branch.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">
                {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
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
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                    <span>ج.م {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={sendToWhatsApp}
              disabled={
                !customerName ||
                !customerPhone ||
                (deliveryType === "delivery" && !customerAddress) ||
                (deliveryType === "pickup" && !selectedBranch)
              }
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lang === "ar"
                ? "إرسال الطلب عبر واتساب"
                : "Send Order via WhatsApp"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
