"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { GoogleAuthProvider } from "@/providers/google-oauth-provider";
import { Toaster } from "@/components/ui/toaster";
import { store } from "@/store";
import { AuthBootstrap, CartBootstrap } from "@/store/bootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <GoogleAuthProvider>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <AuthBootstrap />
          <CartBootstrap />
          {children}
          <Toaster />
        </ReduxProvider>
      </QueryClientProvider>
    </GoogleAuthProvider>
  );
}
