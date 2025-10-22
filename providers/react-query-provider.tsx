"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - البيانات تعتبر fresh لمدة 5 دقائق
            gcTime: 30 * 60 * 1000, // 30 minutes - البيانات تبقى في الذاكرة لمدة 30 دقيقة
            refetchOnWindowFocus: false, // عدم إعادة الجلب عند الرجوع للنافذة
            refetchOnMount: false, // عدم إعادة الجلب عند mount إذا كانت البيانات fresh
            refetchOnReconnect: true, // إعادة الجلب عند الاتصال بالإنترنت
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development only */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
