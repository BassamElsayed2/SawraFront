import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

// أنواع الإجراءات
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  RESTORE_CART: "RESTORE_CART",
};

// دالة لتوليد معرف فريد للمنتج
const generateItemId = (productId, size) => {
  return `${productId}-${size}`;
};

// reducer لإدارة حالة السلة
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity, size } = action.payload;
      const itemId = generateItemId(product.id, size);

      const existingItem = state.items.find((item) => item.id === itemId);

      if (existingItem) {
        // إذا كان المنتج موجود بالفعل، نزيد الكمية
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        // إضافة منتج جديد
        const newItem = {
          id: itemId,
          productId: product.id,
          name: product.title_en || product.title_ar,
          nameAr: product.title_ar,
          nameEn: product.title_en,
          image: product.images?.[0],
          size,
          sizeLabel: getSizeLabel(size, product),
          price: getPriceBySize(product, size),
          offer: getOfferBySize(product, size),
          quantity,
          category: product.category,
        };

        return {
          ...state,
          items: [...state.items, newItem],
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        ),
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: [],
      };
    }

    case CART_ACTIONS.RESTORE_CART: {
      return {
        ...state,
        items: action.payload,
      };
    }

    default:
      return state;
  }
};

// دوال مساعدة
const getPriceBySize = (product, size) => {
  const priceMap = {
    price: product.price,
    price_small: product.price_small,
    price_medium: product.price_medium,
    price_large: product.price_large,
    price_family: product.price_family,
  };
  return priceMap[size] || product.price;
};

const getOfferBySize = (product, size) => {
  const offerMap = {
    price: product.offers,
    price_small: product.offers_small,
    price_medium: product.offers_medium,
    price_large: product.offers_large,
    price_family: product.offers_family,
  };
  return offerMap[size] || product.offers;
};

const getSizeLabel = (size, product) => {
  const isCrepe = product.category?.name_en === "Crepe";

  const sizeLabels = {
    price: { en: "Regular", ar: "عادي" },
    price_small: { en: "Small", ar: "صغير" },
    price_medium: { en: "Medium", ar: "متوسط" },
    price_large: {
      en: isCrepe ? "role medium" : "Large",
      ar: isCrepe ? "رول وسط" : "كبير",
    },
    price_family: {
      en: isCrepe ? "role large" : "Family",
      ar: isCrepe ? "رول كبير" : "عائلي",
    },
  };

  return sizeLabels[size] || { en: "Regular", ar: "عادي" };
};

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
  });

  // حفظ السلة في localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  // تحميل السلة من localStorage عند بدء التطبيق
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.RESTORE_CART,
          payload: items,
        });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // إضافة منتج إلى السلة
  const addToCart = (product, quantity, size) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity, size },
    });
  };

  // إزالة منتج من السلة
  const removeFromCart = (itemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: itemId,
    });
  };

  // تحديث كمية منتج
  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity },
    });
  };

  // تفريغ السلة
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // حساب إجمالي السلة
  const getTotal = () => {
    return state.items.reduce((total, item) => {
      const finalPrice = item.offer > 0 ? item.price - item.offer : item.price;
      return total + finalPrice * item.quantity;
    }, 0);
  };

  // حساب عدد العناصر في السلة
  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook لاستخدام context السلة
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
