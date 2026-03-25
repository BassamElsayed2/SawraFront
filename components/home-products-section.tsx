"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getImageUrl } from "@/lib/image-url";
import { ProductWithTypes } from "@/services/apiProduct";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";

interface HomeProductsSectionProps {
  lang: "en" | "ar";
  title: string;
  subtitle?: string;
  products: ProductWithTypes[];
  viewAllHref: string;
  viewAllLabel: string;
}

export default function HomeProductsSection({
  lang,
  title,

  products,
  viewAllHref,
  viewAllLabel,
}: HomeProductsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [selectedItem, setSelectedItem] = useState<ProductWithTypes | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { addToCart, selectedBranchId } = useCart();

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(2);
      else if (window.innerWidth < 768) setItemsPerView(3);
      else if (window.innerWidth < 1024) setItemsPerView(4);
      else setItemsPerView(5);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const openItemDialog = (item: ProductWithTypes) => {
    setSelectedItem(item);
    if (item.types?.length && item.types[0].sizes?.length) {
      setSelectedSize(item.types[0].sizes[0].id || "");
    } else {
      setSelectedSize("");
    }
    setQuantity(1);
    setNotes("");
  };

  const calculateTotalPrice = () => {
    if (!selectedItem || !selectedSize) return 0;
    let basePrice = 0;
    for (const type of selectedItem.types || []) {
      const size = type.sizes?.find((s) => s.id === selectedSize);
      if (size) {
        basePrice = size.offer_price ?? size.price;
        break;
      }
    }
    return basePrice * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedBranchId) {
      toast({
        title: lang === "ar" ? "يرجى اختيار الفرع" : "Please select a branch",
        description:
          lang === "ar"
            ? "يجب اختيار فرع قبل إضافة المنتجات للسلة"
            : "You must select a branch before adding products to cart",
        variant: "destructive",
      });
      return;
    }
    if (!selectedItem || !selectedSize) return;

    const selectedSizeData = selectedItem.types
      ?.find((t) => t.sizes?.some((s) => s.id === selectedSize))
      ?.sizes?.find((s) => s.id === selectedSize);

    const cartItem = {
      id: selectedItem.id?.toString() || "",
      type: "product" as const,
      title_ar: selectedItem.title_ar,
      title_en: selectedItem.title_en,
      image_url: selectedItem.image_url,
      size: selectedSize,
      sizeData: selectedSizeData,
      variants: [] as string[],
      quantity,
      totalPrice: calculateTotalPrice(),
      notes: notes.trim() || undefined,
    };
    addToCart(cartItem, selectedBranchId);
    setSelectedItem(null);
    toast({
      title: lang === "ar" ? "تمت الإضافة للسلة" : "Added to cart",
      description:
        lang === "ar"
          ? `تم إضافة ${selectedItem.title_ar} إلى السلة`
          : `${selectedItem.title_en} added to cart`,
      duration: 1200,
    });
  };

  if (!products.length) return null;

  const totalSlides = Math.ceil(products.length / itemsPerView);
  const maxIndex = Math.max(0, totalSlides - 1);
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));

  // Track: (products.length / itemsPerView) * 100% of viewport. Each item = (100/products.length) of track.
  const trackWidthPercent = (100 * products.length) / itemsPerView;
  const itemWidthPercent = 100 / products.length;
  // One slide = one viewport = (100 * itemsPerView / products.length)% of track
  const stepPercent = (100 * itemsPerView) / products.length;

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-gray-50/50 to-red-50/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h2>
          </div>
          <Link href={viewAllHref}>
            <Button variant="outline" size="sm" className="gap-1">
              {viewAllLabel}
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                width: `${trackWidthPercent}%`,
                transform: `translateX(${
                  lang === "ar"
                    ? `${currentIndex * stepPercent}%`
                    : `-${currentIndex * stepPercent}%`
                })`,
              }}
            >
              {products.map((item) => {
                const firstSize = item.types?.[0]?.sizes?.[0];
                const price = firstSize?.offer_price ?? firstSize?.price;
                const originalPrice =
                  firstSize?.offer_price ? firstSize.price : undefined;
                const description =
                  lang === "ar" ? item.description_ar : item.description_en;
                const plainDescription = description
                  ?.replace(/<[^>]*>/g, "")
                  .trim();

                return (
                  <div
                    key={item.id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${itemWidthPercent}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => openItemDialog(item)}
                      className="block h-full w-full text-start"
                    >
                      <Card className="group overflow-hidden h-full border border-gray-100/80 bg-white shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-red-100 rounded-2xl cursor-pointer">
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={
                                lang === "ar" ? item.title_ar : item.title_en
                              }
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                            {originalPrice && (
                              <span className="absolute top-3 start-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                                {lang === "ar" ? "عرض" : "SALE"}
                              </span>
                            )}
                            <span className="absolute bottom-3 left-3 right-3 text-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm py-2 rounded-lg">
                              {lang === "ar" ? "عرض المنتج" : "View product"}
                            </span>
                          </div>
                          <div className="p-4 flex flex-col flex-1 gap-2">
                            <h3 className="font-bold text-gray-800 line-clamp-1 text-sm leading-snug group-hover:text-red-600 transition-colors duration-200">
                              {lang === "ar" ? item.title_ar : item.title_en}
                            </h3>
                            {plainDescription && (
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {plainDescription}
                              </p>
                            )}
                            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                              {price != null ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-base font-extrabold text-red-600">
                                    {price.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] font-medium text-red-600/70">
                                    {lang === "ar" ? "ج.م" : "EGP"}
                                  </span>
                                  {originalPrice && (
                                    <span className="text-[11px] text-gray-400 line-through ms-1">
                                      {originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {lang === "ar"
                                    ? "السعر غير متوفر"
                                    : "Price N/A"}
                                </span>
                              )}
                              <span className="text-[10px] text-red-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {lang === "ar" ? "اطلب الآن" : "Order Now"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {products.length > itemsPerView && (
            <>
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white border-0 text-gray-600 hover:text-red-500 rounded-full w-10 h-10 md:w-12 md:h-12 z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white border-0 text-gray-600 hover:text-red-500 rounded-full w-10 h-10 md:w-12 md:h-12 z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {products.length > itemsPerView && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-red-500 w-6"
                    : "bg-gray-300 hover:bg-gray-400 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product detail popup */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl font-bold">
                  {lang === "ar"
                    ? selectedItem.title_ar
                    : selectedItem.title_en}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <img
                      src={getImageUrl(selectedItem.image_url)}
                      alt={
                        lang === "ar"
                          ? selectedItem.title_ar
                          : selectedItem.title_en
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {(selectedItem.description_ar ||
                    selectedItem.description_en) && (
                    <div
                      className="text-gray-600 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          lang === "ar"
                            ? (selectedItem.description_ar ?? "")
                            : (selectedItem.description_en ?? ""),
                      }}
                    />
                  )}

                  {/* Types and Sizes */}
                  <div>
                    <h4 className="font-bold text-lg mb-3">
                      {lang === "ar"
                        ? "اختر النوع والحجم:"
                        : "Choose Type and Size:"}
                    </h4>
                    <div className="space-y-3">
                      {selectedItem.types?.map((type) => (
                        <div
                          key={type.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <h5 className="font-semibold text-base mb-2">
                            {lang === "ar" ? type.name_ar : type.name_en}
                          </h5>
                          <div className="grid grid-cols-1 gap-2">
                            {type.sizes?.map((size) => (
                              <div
                                key={size.id}
                                onClick={() => setSelectedSize(size.id || "")}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedSize === size.id
                                    ? "border-red-500 bg-red-50 shadow-md"
                                    : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {lang === "ar"
                                      ? size.size_ar
                                      : size.size_en}
                                  </span>
                                  <span className="text-lg font-bold text-red-600">
                                    {lang === "ar" ? "ج.م" : "EGP"}{" "}
                                    {size.offer_price
                                      ? size.offer_price.toFixed(2)
                                      : size.price.toFixed(2)}
                                    {size.offer_price && (
                                      <span className="text-sm text-gray-500 line-through ms-2">
                                        {size.price.toFixed(2)}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      {lang === "ar" ? "الكمية:" : "Quantity:"}
                    </h4>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="rounded-full w-10 h-10"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xl font-bold w-12 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="rounded-full w-10 h-10"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      {lang === "ar"
                        ? "ملاحظات (اختياري):"
                        : "Notes (Optional):"}
                    </h4>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        lang === "ar"
                          ? "حار، عادي، بدون فلفل..."
                          : "Hot, Normal, No pepper..."
                      }
                      className="min-h-[80px] resize-none"
                      maxLength={200}
                    />
                    <p className="text-right text-sm text-gray-500 mt-1">
                      {notes.length}/200
                    </p>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100/80 p-4 rounded-2xl">
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">
                        {lang === "ar" ? "الإجمالي" : "Total"}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {lang === "ar" ? "ج.م" : "EGP"}{" "}
                        {calculateTotalPrice().toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
