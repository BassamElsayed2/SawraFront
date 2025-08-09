"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Minus,
  Plus,
  Clock,
  Calendar,
} from "lucide-react";
import { getComboOffers, ComboOffer } from "@/services/apiOffers";
import { useCart } from "@/contexts/cart-context";
import CartSummary from "./cart-summary";

interface OffersSliderProps {
  lang: "en" | "ar";
  dict: any;
}

export default function OffersSlider({ lang, dict }: OffersSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<ComboOffer | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [offers, setOffers] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);
  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const offersData = await getComboOffers();
      setOffers(offersData);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }

    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= offers.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, offers.length - itemsPerView) : prev - 1
    );
  };

  const openOfferDialog = (offer: ComboOffer) => {
    setSelectedOffer(offer);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedOffer) {
      const cartItem = {
        id: selectedOffer.id.toString(),
        type: "offer" as const,
        title_ar: selectedOffer.title_ar,
        title_en: selectedOffer.title_en,
        image_url: selectedOffer.image_url || undefined,
        quantity,
        totalPrice: selectedOffer.total_price * quantity,
        offer_id: selectedOffer.id.toString(),
      };
      addToCart(cartItem);
      setSelectedOffer(null);
    }
  };

  const getDaysRemaining = (offer: ComboOffer): number | null => {
    if (!offer.ends_at) return null;

    const now = new Date();
    const utcNow = new Date(now.toISOString()); // لضمان التطابق مع ends_at
    const endDate = new Date(offer.ends_at);

    const timeDiff = endDate.getTime() - utcNow.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return Math.max(daysDiff, 0); // مايرجعش -1 أبدًا
  };

  const isOfferActive = (offer: ComboOffer): boolean => {
    const now = new Date().toISOString(); // Always use ISO to unify format
    const start = offer.starts_at;
    const end = offer.ends_at;

    return (!start || now >= start) && (!end || now <= end);
  };

  if (offers.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-red-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-100">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {lang === "en" ? "No Offers Available" : "لا توجد عروض متاحة"}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {lang === "en"
                    ? "We're preparing amazing offers for you! Check back soon for exclusive deals and special discounts."
                    : "نحن نعد عروضاً مذهلة لك! عد قريباً للحصول على عروض حصرية وخصومات خاصة."}
                </p>
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-red-100 text-red-700 hover:bg-red-200"
          >
            {lang === "en" ? "🔥 Special Offers" : "🔥 عروض خاصة"}
          </Badge>

          <p className="text-[14px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {lang === "en"
              ? "Discover our amazing combo deals and save big on your favorite meals!"
              : "اكتشف عروض الكومبو المذهلة ووفر الكثير على وجباتك المفضلة!"}
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${
                  lang === "ar"
                    ? currentIndex * (100 / itemsPerView)
                    : -currentIndex * (100 / itemsPerView)
                }%)`,
              }}
            >
              {offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
                    <CardContent className="p-0 relative">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={offer.image_url || "/placeholder.svg"}
                          alt={lang === "en" ? offer.title_en : offer.title_ar}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Offer Badge */}
                        <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white border-0">
                          {lang === "en" ? "Special Offer" : "عرض خاص"}
                        </Badge>

                        {/* Days Remaining */}
                        {(() => {
                          const daysRemaining = getDaysRemaining(offer);
                          return daysRemaining !== null && daysRemaining > 0 ? (
                            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2">
                              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-white text-xs">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {daysRemaining === 1
                                    ? lang === "en"
                                      ? "Last Day!"
                                      : "اليوم الأخير!"
                                    : `${daysRemaining} ${
                                        lang === "en"
                                          ? "days left"
                                          : "يوم متبقي"
                                      }`}
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge
                            variant={
                              isOfferActive(offer) ? "default" : "secondary"
                            }
                            className={`${
                              isOfferActive(offer)
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {isOfferActive(offer)
                              ? lang === "en"
                                ? "Active"
                                : "نشط"
                              : lang === "en"
                              ? "Expired"
                              : "انتهي العرض"}
                          </Badge>
                          {!isOfferActive(offer) && (
                            <Badge variant="outline" className="text-xs">
                              {lang === "en" ? "Limited Time" : "وقت محدود"}
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-[15px] font-medium text-gray-800 leading-tight group-hover:text-red-600 transition-colors">
                          {lang === "en" ? offer.title_en : offer.title_ar}
                        </h3>

                        {/* Description */}
                        {offer.description_ar && offer.description_en && (
                          <p className="text-gray-600 text-[12px] line-clamp-2">
                            {lang === "en"
                              ? offer.description_en
                              : offer.description_ar}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-red-600">
                            ${offer.total_price.toFixed(2)}
                          </div>
                        </div>

                        {/* Choose Button */}
                        <Button
                          onClick={() => openOfferDialog(offer)}
                          disabled={!isOfferActive(offer)}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isOfferActive(offer)
                            ? lang === "en"
                              ? "Order Now"
                              : "اطلب الآن"
                            : lang === "en"
                            ? "Offer Ended"
                            : "انتهي العرض"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {offers.length > itemsPerView && (
            <>
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white border-0 text-gray-600 hover:text-red-500 rounded-full w-12 h-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white border-0 text-gray-600 hover:text-red-500 rounded-full w-12 h-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {offers.length > itemsPerView && (
          <div className="flex justify-center mt-8 space-x-2 rtl:space-x-reverse">
            {Array.from({
              length: Math.ceil(offers.length / itemsPerView),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? "bg-red-500 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Offer Detail Dialog */}
      <Dialog
        open={!!selectedOffer}
        onOpenChange={() => setSelectedOffer(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-right">
                  {lang === "en"
                    ? selectedOffer.title_en
                    : selectedOffer.title_ar}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <img
                      src={selectedOffer.image_url || "/placeholder.svg"}
                      alt={
                        lang === "en"
                          ? selectedOffer.title_en
                          : selectedOffer.title_ar
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Days Remaining */}
                  {(() => {
                    const daysRemaining = getDaysRemaining(selectedOffer);
                    return daysRemaining !== null && daysRemaining > 0 ? (
                      <div className="bg-red-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-700">
                          <Clock className="h-5 w-5" />
                          <span className="font-semibold">
                            {lang === "en"
                              ? "Time Remaining:"
                              : "الوقت المتبقي:"}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          {daysRemaining === 1
                            ? lang === "en"
                              ? "Last Day!"
                              : "اليوم الأخير!"
                            : `${daysRemaining} ${
                                lang === "en" ? "days left" : "يوم متبقي"
                              }`}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  {selectedOffer.description_ar &&
                    selectedOffer.description_en && (
                      <div>
                        <h4 className="font-bold text-xl mb-4">
                          {lang === "en" ? "Description" : "الوصف"}:
                        </h4>
                        <p className="text-gray-600 text-[13px] leading-relaxed">
                          {lang === "en"
                            ? selectedOffer.description_en
                            : selectedOffer.description_ar}
                        </p>
                      </div>
                    )}

                  {/* Quantity Selection */}
                  <div>
                    <h4 className="font-bold text-lg mb-4">
                      {lang === "en" ? "Quantity" : "الكمية"}:
                    </h4>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xl font-bold w-1 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="bg-red-50 p-6 rounded-2xl">
                    <div className="text-2xl font-bold text-red-600 text-center">
                      {lang === "en" ? "Total" : "الإجمالي"}: $
                      {(selectedOffer.total_price * quantity).toFixed(2)}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={!isOfferActive(selectedOffer)}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOfferActive(selectedOffer)
                      ? lang === "en"
                        ? "Add to Cart"
                        : "أضف للسلة"
                      : lang === "en"
                      ? "Offer Ended"
                      : "انتهي العرض"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Summary */}
      <CartSummary lang={lang} />

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
    </section>
  );
}
