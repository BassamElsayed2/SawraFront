import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  type: "product" | "offer";
  title_ar: string;
  title_en: string;
  image_url?: string;
  quantity: number;
  totalPrice: number;
  size?: string;
  sizeData?: any;
  variants?: string[];
  offer_id?: string;
  notes?: string;
  branch_id?: string;
}

interface CartState {
  cart: CartItem[];
  selectedBranchId: string | null;
  hydrated: boolean;
}

const initialState: CartState = {
  cart: [],
  selectedBranchId: null,
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (
      state,
      action: PayloadAction<{ cart: CartItem[]; selectedBranchId: string | null }>
    ) => {
      state.cart = action.payload.cart || [];
      state.selectedBranchId = action.payload.selectedBranchId || null;
      state.hydrated = true;
    },
    addToCart: (
      state,
      action: PayloadAction<{ item: CartItem; branchId: string }>
    ) => {
      const { item, branchId } = action.payload;
      const itemWithBranch = { ...item, branch_id: branchId };

      const existingIndex = state.cart.findIndex((cartItem) => {
        if (cartItem.type !== item.type) return false;
        if (cartItem.type === "product") {
          return (
            cartItem.id === item.id &&
            cartItem.size === item.size &&
            JSON.stringify(cartItem.variants?.slice().sort()) ===
              JSON.stringify(item.variants?.slice().sort())
          );
        }
        return cartItem.id === item.id;
      });

      if (existingIndex >= 0) {
        state.cart[existingIndex] = {
          ...state.cart[existingIndex],
          quantity: state.cart[existingIndex].quantity + item.quantity,
          totalPrice: state.cart[existingIndex].totalPrice + item.totalPrice,
        };
      } else {
        state.cart.push({ ...itemWithBranch, id: `${item.id}-${Date.now()}` });
      }

      if (!state.selectedBranchId) {
        state.selectedBranchId = branchId;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.cart = state.cart.filter((item) => item.id !== id);
        return;
      }

      state.cart = state.cart.map((item) => {
        if (item.id === id) {
          const pricePerUnit = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity,
            totalPrice: pricePerUnit * quantity,
          };
        }
        return item;
      });
    },
    clearCart: (state) => {
      state.cart = [];
      state.selectedBranchId = null;
    },
    setSelectedBranch: (state, action: PayloadAction<string>) => {
      state.selectedBranchId = action.payload || null;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setSelectedBranch,
} = cartSlice.actions;

export default cartSlice.reducer;
