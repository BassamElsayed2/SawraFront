"use client";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CartFooterButtonProps {
  lang: "en" | "ar";
}

export default function CartFooterButton({ lang }: CartFooterButtonProps) {
  const { getTotalItems, getTotalPrice, cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Don't show the button if cart is empty
  if (totalItems === 0) {
    return null;
  }

  const handleContinue = () => {
    // If user is signed in, go to checkout, otherwise go to cart
    if (user) {
      router.push(`/${lang}/checkout`);
    } else {
      router.push(`/${lang}/checkout`);
    }
  };

  return (
    <div
      className={`fixed bottom-6 z-50 ${lang === "ar" ? "right-6" : "right-6"}`}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div
        onClick={handleContinue}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden min-w-[280px] max-w-[320px]"
      >
        <div className="px-5 py-4 space-y-3">
          {/* Cart Icon and Items Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium opacity-90">
                  {lang === "ar" ? "عدد المنتجات" : "Items"}
                </div>
                <div className="text-xl font-bold">{totalItems}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20"></div>

          {/* Total Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-90">
                {lang === "ar" ? "الإجمالي" : "Total"}
              </div>
              <div className="text-xl font-bold">
                {totalPrice.toFixed(2)}{" "}
                <span className="text-sm">{lang === "ar" ? "ج.م" : "EGP"}</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="border-t border-white/20 pt-3 -mb-1">
            <div className="flex items-center justify-center gap-2 font-bold text-base">
              {user
                ? lang === "ar"
                  ? "إتمام الطلب"
                  : "Checkout"
                : lang === "ar"
                ? "متابعة الطلب"
                : "Continue"}
              {lang === "ar" ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(${lang === "ar" ? "-" : ""}150%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
