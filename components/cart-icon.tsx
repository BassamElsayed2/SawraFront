"use client";

import { useState } from "react";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CartIconProps {
  lang: "en" | "ar";
  dict?: any;
  variant?: "dark" | "light";
}

export default function CartIcon({
  lang,
  dict,
  variant = "dark",
}: CartIconProps) {
  const { cart, getTotalItems, getTotalPrice, updateQuantity, removeFromCart } =
    useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleContinueToCheckout = () => {
    setIsOpen(false);
    router.push(`/${lang}/checkout`);
  };

  const iconColor = variant === "dark" ? "text-white" : "text-gray-800";
  const textColor = variant === "dark" ? "text-white" : "text-gray-800";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative hover:bg-red-500/20 transition-all duration-200 ${iconColor}`}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs font-bold border-2 border-background">
              {totalItems}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0"
        align={lang === "ar" ? "start" : "end"}
        side="bottom"
      >
        {cart.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              {lang === "ar" ? "السلة فارغة" : "Cart is empty"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-red-600" />
                  {lang === "ar" ? "سلة التسوق" : "Shopping Cart"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={lang === "ar" ? item.title_ar : item.title_en}
                    width={60}
                    height={60}
                    className="rounded-md object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {lang === "ar" ? item.title_ar : item.title_en}
                    </h4>

                    {item.type === "product" && item.sizeData && (
                      <p className="text-xs text-gray-500">
                        {lang === "ar"
                          ? item.sizeData.size_ar
                          : item.sizeData.size_en}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {item.totalPrice.toFixed(2)} ج.م
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:bg-red-100"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">
                  {lang === "ar" ? "الإجمالي:" : "Total:"}
                </span>
                <span className="text-xl font-bold text-red-600">
                  {totalPrice.toFixed(2)} ج.م
                </span>
              </div>

              <Button
                onClick={handleContinueToCheckout}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
              >
                {lang === "ar" ? "متابعة الطلب" : "Continue Order"}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
