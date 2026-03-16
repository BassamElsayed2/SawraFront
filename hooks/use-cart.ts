"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  CartItem,
  addToCart as addToCartAction,
  clearCart as clearCartAction,
  removeFromCart as removeFromCartAction,
  setSelectedBranch as setSelectedBranchAction,
  updateQuantity as updateQuantityAction,
} from "@/store/slices/cart-slice";

export function useCart() {
  const dispatch = useAppDispatch();
  const { cart, selectedBranchId } = useAppSelector((state) => state.cart);

  const addToCart = (item: CartItem, branchId: string) => {
    dispatch(addToCartAction({ item, branchId }));
  };

  const removeFromCart = (id: string) => {
    dispatch(removeFromCartAction(id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantityAction({ id, quantity }));
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  const setSelectedBranch = (branchId: string) => {
    dispatch(setSelectedBranchAction(branchId));
  };

  const getTotalPrice = () =>
    cart.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);

  const getTotalItems = () =>
    cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return {
    cart,
    selectedBranchId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    setSelectedBranch,
  };
}

export type { CartItem };
