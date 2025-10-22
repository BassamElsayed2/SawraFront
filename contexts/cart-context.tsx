"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";

export interface CartItem {
  id: string;
  type: "product" | "offer";
  title_ar: string;
  title_en: string;
  image_url?: string;
  quantity: number;
  totalPrice: number;
  // For products
  size?: string;
  sizeData?: any;
  variants?: string[];
  // For offers
  offer_id?: string;
  // Notes field
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Load cart from localStorage with cache validation
    const savedCart = localStorage.getItem("restaurant-cart");
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Check if cart has timestamp and is less than 7 days old
        if (cartData.timestamp) {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - cartData.timestamp < sevenDays) {
            setCart(cartData.cart || []);
          } else {
            // Cart is too old, clear it
            localStorage.removeItem("restaurant-cart");
          }
        } else {
          // Old format without timestamp, still load it
          setCart(Array.isArray(cartData) ? cartData : []);
        }
      } catch (error) {
        // Invalid cart data in localStorage - reset to empty cart
        localStorage.removeItem("restaurant-cart");
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage with timestamp
    if (mounted) {
      localStorage.setItem(
        "restaurant-cart",
        JSON.stringify({
          cart,
          timestamp: Date.now(),
        })
      );
    }
  }, [cart, mounted]);

  // When user logs in, we could sync cart with server
  // For now, we'll keep the local cart
  useEffect(() => {
    if (user && mounted) {
      // Future: Load user's saved cart from server
    }
  }, [user, mounted]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if item already exists (same id, size, variants)
      const existingIndex = prev.findIndex((cartItem) => {
        if (cartItem.type !== item.type) return false;
        if (cartItem.type === "product") {
          return (
            cartItem.id === item.id &&
            cartItem.size === item.size &&
            JSON.stringify(cartItem.variants?.sort()) ===
              JSON.stringify(item.variants?.sort())
          );
        } else {
          return cartItem.id === item.id;
        }
      });

      if (existingIndex >= 0) {
        // Update existing item quantity
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + item.quantity,
          totalPrice: newCart[existingIndex].totalPrice + item.totalPrice,
        };
        return newCart;
      } else {
        // Add new item
        return [...prev, { ...item, id: `${item.id}-${Date.now()}` }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const pricePerUnit = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity,
            totalPrice: pricePerUnit * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
