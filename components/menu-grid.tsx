"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Heart,
  Filter,
  Loader2,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import { getProducts, ProductWithTypes } from "@/services/apiProduct";
import { getCategories as getCategoriesData } from "@/services/apiCategories";
import { getBranches, Branch } from "@/services/apiBranches";

interface MenuGridProps {
  lang: "en" | "ar";
  dict: any;
}

export default function MenuGrid({ lang, dict }: MenuGridProps) {
  const [selectedItem, setSelectedItem] = useState<ProductWithTypes | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  // Customer info dialog state
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesData,
  });

  // Fetch products with category filter
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () =>
      getProducts(1, 100, {
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
      }),
    enabled: mounted,
  });

  // Fetch branches
  const {
    data: branches = [],
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: mounted,
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;

  const openItemDialog = (item: ProductWithTypes) => {
    setSelectedItem(item);
    // Set default size to the first available size
    if (
      item.types &&
      item.types.length > 0 &&
      item.types[0].sizes &&
      item.types[0].sizes.length > 0
    ) {
      setSelectedSize(item.types[0].sizes[0].id || "");
    }
    setSelectedVariants([]);
    setQuantity(1);
  };

  const toggleVariant = (variantId: string) => {
    setSelectedVariants((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedItem || !selectedSize) return 0;

    let basePrice = 0;

    for (const type of selectedItem.types || []) {
      const size = type.sizes?.find((s) => s.id === selectedSize);
      if (size) {
        // Use offer price if available, otherwise use regular price
        basePrice = size.offer_price ?? size.price;
        break;
      }
    }

    // Add variants price (you need to update this if variants have offers too)
    const variantsPrice = selectedVariants.reduce((total, variantId) => {
      // Example placeholder – modify as per your data
      return total + 0;
    }, 0);

    return (basePrice + variantsPrice) * quantity;
  };

  const addToCart = () => {
    if (selectedItem && selectedSize) {
      const selectedSizeData = selectedItem.types
        ?.find((type) => type.sizes?.some((size) => size.id === selectedSize))
        ?.sizes?.find((size) => size.id === selectedSize);

      const cartItem = {
        ...selectedItem,
        size: selectedSize,
        sizeData: selectedSizeData,
        variants: selectedVariants,
        quantity,
        totalPrice: calculateTotalPrice(),
      };
      setCart([...cart, cartItem]);
      setSelectedItem(null);
    }
  };

  const openCustomerDialog = () => {
    if (cart.length === 0) return;
    setShowCustomerDialog(true);
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;

    const orderText = cart
      .map((item) => {
        const variants =
          item.variants.length > 0 ? ` (${item.variants.join(", ")})` : "";
        const title = lang === "ar" ? item.title_ar : item.title_en;
        const sizeName = item.sizeData
          ? lang === "ar"
            ? item.sizeData.size_ar
            : item.sizeData.size_en
          : "";
        return `${title} - ${sizeName}${variants} x${
          item.quantity
        } - $${item.totalPrice.toFixed(2)}`;
      })
      .join("\n");

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    // Customer info
    const customerInfo = `معلومات العميل:\nالاسم: ${customerName}\nالهاتف: ${customerPhone}`;

    // Delivery info
    let deliveryInfo = "";
    if (deliveryType === "delivery") {
      deliveryInfo = `\nنوع التوصيل: توصيل للمنزل\nالعنوان: ${customerAddress}`;
    } else {
      const selectedBranchData = branches.find(
        (b) => b.id.toString() === selectedBranch
      );
      deliveryInfo = `\nنوع التوصيل: استلام من الفرع\nالفرع: ${
        selectedBranchData
          ? lang === "ar"
            ? selectedBranchData.name_ar
            : selectedBranchData.name_en
          : ""
      }`;
    }

    const message = `${customerInfo}${deliveryInfo}\n\nالطلب:\n${orderText}\n\nالإجمالي: $${total.toFixed(
      2
    )}`;

    if (mounted) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      setShowCustomerDialog(false);
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setDeliveryType("delivery");
      setSelectedBranch("");
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-300 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (categoriesLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <span className="text-lg font-semibold">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesError || productsError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20">
          <div className="text-red-500 text-lg font-semibold mb-4">
            حدث خطأ في تحميل البيانات
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Button
          onClick={() => setSelectedCategory("all")}
          variant={selectedCategory === "all" ? "default" : "outline"}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            selectedCategory === "all"
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
              : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          }`}
        >
          <Filter className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
          {lang === "ar" ? "الكل" : "All"}
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id.toString())}
            variant={
              selectedCategory === category.id.toString()
                ? "default"
                : "outline"
            }
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              selectedCategory === category.id.toString()
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            }`}
          >
            <Filter className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {lang === "ar" ? category.name_ar : category.name_en}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((item, index) => (
          <Card
            key={item.id}
            className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-3"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            <CardContent className="p-0 relative">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={lang === "ar" ? item.title_ar : item.title_en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge
                    variant="outline"
                    className="bg-white/90 text-gray-700 border-0"
                  >
                    {categories.find(
                      (cat) => cat.id.toString() === item.category_id
                    )?.name_ar || "فئة"}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-red-600 transition-colors duration-300">
                  {lang === "ar" ? item.title_ar : item.title_en}
                </h3>

                <p className="text-gray-600 line-clamp-2 leading-relaxed text-[13px]">
                  {lang === "ar" ? item.description_ar : item.description_en}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-sm">
                    {item.types?.length || 0}{" "}
                    {lang === "ar" ? "أنواع متاحة" : "types available"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.types?.reduce(
                      (total, type) => total + (type.sizes?.length || 0),
                      0
                    ) || 0}{" "}
                    {lang === "ar" ? "أحجام متاحة" : "sizes available"}
                  </div>
                </div>

                <Button
                  onClick={() => openItemDialog(item)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {lang === "ar" ? "اختر الآن" : "Choose Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-right">
                  {lang === "ar"
                    ? selectedItem.title_ar
                    : selectedItem.title_en}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <img
                      src={selectedItem.image_url || "/placeholder.svg"}
                      alt={
                        lang === "ar"
                          ? selectedItem.title_ar
                          : selectedItem.title_en
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-100 text-red-700">
                      {categories.find(
                        (cat) => cat.id.toString() === selectedItem.category_id
                      )?.name_ar || "فئة"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {lang === "ar"
                      ? selectedItem.description_ar
                      : selectedItem.description_en}
                  </p>

                  {/* Types and Sizes Selection */}
                  <div>
                    <h4 className="font-bold text-xl mb-4">
                      {lang === "ar"
                        ? "اختر النوع والحجم:"
                        : "Choose Type and Size:"}
                    </h4>
                    <div className="space-y-4">
                      {selectedItem.types?.map((type) => (
                        <div key={type.id} className="border rounded-lg p-4">
                          <h5 className="font-semibold text-lg mb-3">
                            {lang === "ar" ? type.name_ar : type.name_en}
                          </h5>
                          <div className="grid grid-cols-1 gap-3">
                            {type.sizes?.map((size) => (
                              <div
                                key={size.id}
                                onClick={() => setSelectedSize(size.id || "")}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                  selectedSize === size.id
                                    ? "border-red-500 bg-red-50 shadow-lg transform scale-[1.02]"
                                    : "border-gray-200 hover:border-red-300 hover:bg-red-25"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-lg">
                                      {lang === "ar"
                                        ? size.size_ar
                                        : size.size_en}
                                    </div>
                                  </div>
                                  <div className="text-xl font-bold text-red-600">
                                    $
                                    {size.offer_price
                                      ? size.offer_price.toFixed(2)
                                      : size.price.toFixed(2)}
                                    {size.offer_price && (
                                      <span className="text-sm text-gray-500 line-through ml-2">
                                        ${size.price.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div>
                    <h4 className="font-bold text-xl mb-4">
                      {lang === "ar" ? "الكمية:" : "Quantity:"}
                    </h4>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-full w-10 h-10"
                      >
                        <Minus className="h-3 w-3 " />
                      </Button>
                      <span className="text-2xl font-bold w-16 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="rounded-full w-10 h-10"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-2 rounded-2xl">
                    <div className="text-center">
                      <div className="text-lg text-gray-600 mb-2">
                        {lang === "ar" ? "الإجمالي" : "Total"}
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        ${calculateTotalPrice().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={addToCart}
                    disabled={!selectedSize}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white p-6 rounded-2xl shadow-2xl border z-50 animate-bounce">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              {cart.length}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {lang === "ar" ? "عنصر في السلة" : "items in cart"}
              </div>
              <div className="text-gray-500 text-sm">
                {lang === "ar" ? "الإجمالي:" : "Total:"} $
                {cart
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </div>
            </div>
            <Button
              onClick={openCustomerDialog}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              {lang === "ar" ? "إرسال عبر واتساب" : "Send via WhatsApp"}
            </Button>
          </div>
        </div>
      )}

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
                        {item.sizeData
                          ? lang === "ar"
                            ? item.sizeData.size_ar
                            : item.sizeData.size_en
                          : ""}{" "}
                        x {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                    <span>
                      $
                      {cart
                        .reduce((sum, item) => sum + item.totalPrice, 0)
                        .toFixed(2)}
                    </span>
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
