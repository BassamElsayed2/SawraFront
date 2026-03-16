"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe } from "@/store/slices/auth-slice";
import { hydrateCart } from "@/store/slices/cart-slice";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      void dispatch(fetchMe());
    }
  }, [dispatch, initialized]);

  return null;
}

export function CartBootstrap() {
  const dispatch = useAppDispatch();
  const { selectedBranchId, hydrated } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(hydrateCart({ cart: [], selectedBranchId: null }));
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedBranchId) {
      document.cookie = `selected_branch_id=${selectedBranchId}; path=/; max-age=2592000; samesite=lax`;
    } else {
      document.cookie = "selected_branch_id=; path=/; max-age=0; samesite=lax";
    }
  }, [selectedBranchId, hydrated]);

  return null;
}
