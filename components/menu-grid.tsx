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
import { Textarea } from "@/components/ui/textarea";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProducts, ProductWithTypes } from "@/services/apiProduct";
import { getCategories as getCategoriesData } from "@/services/apiCategories";

import { useCart } from "@/contexts/cart-context";
import CartSummary from "./cart-summary";

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
  const [notes, setNotes] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesData,
  });

  // Fetch products with category filter and pagination
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", selectedCategory, currentPage, itemsPerPage],
    queryFn: () =>
      getProducts(currentPage, itemsPerPage, {
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
      }),
    enabled: mounted,
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

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
    setNotes("");
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

  const handleAddToCart = () => {
    if (selectedItem && selectedSize) {
      const selectedSizeData = selectedItem.types
        ?.find((type) => type.sizes?.some((size) => size.id === selectedSize))
        ?.sizes?.find((size) => size.id === selectedSize);

      const cartItem = {
        id: selectedItem.id?.toString() || "",
        type: "product" as const,
        title_ar: selectedItem.title_ar,
        title_en: selectedItem.title_en,
        image_url: selectedItem.image_url,
        size: selectedSize,
        sizeData: selectedSizeData,
        variants: selectedVariants,
        quantity,
        totalPrice: calculateTotalPrice(),
        notes: notes.trim() || undefined,
      };
      addToCart(cartItem);
      setSelectedItem(null);
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

                <div
                  className="text-gray-600 line-clamp-2 leading-relaxed text-[13px]"
                  dangerouslySetInnerHTML={{
                    __html:
                      lang === "ar"
                        ? item.description_ar ?? ""
                        : item.description_en ?? "",
                  }}
                />

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

      {/* Pagination Controls */}
      {totalProducts > 0 && (
        <div className="mt-12 space-y-6">
          {/* Items per page selector */}
          <div className="flex justify-center items-center gap-4">
            <Label className="text-sm font-medium">
              {lang === "ar" ? "العناصر في الصفحة:" : "Items per page:"}
            </Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="18">18</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pagination info */}
          <div className="text-center text-sm text-gray-600">
            {lang === "ar" ? (
              <>
                عرض{" "}
                {totalProducts > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
                إلى {Math.min(currentPage * itemsPerPage, totalProducts)} من أصل{" "}
                {totalProducts} منتج
              </>
            ) : (
              <>
                Showing{" "}
                {totalProducts > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, totalProducts)} of{" "}
                {totalProducts} products
              </>
            )}
          </div>

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {/* Previous button */}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || productsLoading}
                className="rounded-full w-10 h-10 hover:bg-red-50 hover:border-red-300"
              >
                {productsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={productsLoading}
                      className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                          : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || productsLoading}
                className="rounded-full w-10 h-10 hover:bg-red-50 hover:border-red-300"
              >
                {productsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}

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
                  <div
                    className="text-gray-600 line-clamp-2 leading-relaxed text-[13px]"
                    dangerouslySetInnerHTML={{
                      __html:
                        lang === "ar"
                          ? selectedItem.description_ar ?? ""
                          : selectedItem.description_en ?? "",
                    }}
                  />

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
                                    ج.م
                                    {size.offer_price
                                      ? size.offer_price.toFixed(2)
                                      : size.price.toFixed(2)}
                                    {size.offer_price && (
                                      <span className="text-sm text-gray-500 line-through ml-2">
                                        ج.م {size.price.toFixed(2)}
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

                  {/* Notes Section */}
                  <div>
                    <h4 className="font-bold text-xl mb-4">
                      {lang === "ar"
                        ? "ملاحظات (اختياري):"
                        : "Notes (Optional):"}
                    </h4>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        lang === "ar"
                          ? "حار  , عادي , بدون فلفل , اضف ملاحظاتك هنا"
                          : "Hot , Normal , No Pepper , Add your notes here"
                      }
                      className="min-h-[80px] resize-none"
                      maxLength={200}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {notes.length}/200
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-2 rounded-2xl">
                    <div className="text-center">
                      <div className="text-lg text-gray-600 mb-2">
                        {lang === "ar" ? "الإجمالي" : "Total"}
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        ج.م {calculateTotalPrice().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
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
      <CartSummary lang={lang} dict={dict} />

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
