"use client";

import { useEffect, useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { fetchMe } from "@/store/slices/auth-slice";
import { hydrateCart } from "@/store/slices/cart-slice";

const CART_STORAGE_KEY = "restaurant-cart";
type CartBootstrapState = {
  cart: any[];
  selectedBranchId: string | null;
  hydrated: boolean;
};

const getCookieValue = (name: string) => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const initialized = useSelector(
    (state: unknown) => !!(state as { auth?: { initialized?: boolean } }).auth?.initialized
  );

  useEffect(() => {
    if (!initialized) {
      void dispatch(fetchMe());
    }
  }, [dispatch, initialized]);

  return null;
}

export function CartBootstrap() {
  const dispatch = useAppDispatch();
  const { cart, selectedBranchId, hydrated } = useSelector(
    (state: unknown) =>
      ((state as { cart?: CartBootstrapState }).cart ?? {
        cart: [],
        selectedBranchId: null,
        hydrated: false,
      }) as CartBootstrapState
  );

  // Runs synchronously after DOM updates, before the browser paints — so cart
  // matches localStorage on the first visible frame (no delayed cart bar).
  useLayoutEffect(() => {
    let storedCart: unknown = null;

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      storedCart = stored ? JSON.parse(stored) : null;
    } catch {
      storedCart = null;
    }

    const cookieBranchId = getCookieValue("selected_branch_id");
    const parsedCart =
      storedCart && typeof storedCart === "object" ? (storedCart as any) : null;

    dispatch(
      hydrateCart({
        cart: Array.isArray(parsedCart?.cart) ? parsedCart.cart : [],
        selectedBranchId:
          typeof parsedCart?.selectedBranchId === "string" &&
          parsedCart.selectedBranchId
            ? parsedCart.selectedBranchId
            : cookieBranchId || null,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ cart, selectedBranchId })
      );
    } catch {
      // Ignore storage write errors in restricted environments
    }

    if (selectedBranchId) {
      document.cookie = `selected_branch_id=${selectedBranchId}; path=/; max-age=2592000; samesite=lax`;
    } else {
      document.cookie = "selected_branch_id=; path=/; max-age=0; samesite=lax";
    }
  }, [cart, selectedBranchId, hydrated]);

  return null;
}
