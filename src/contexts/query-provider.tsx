"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import type { FetchError } from "@/lib/api/types/backend";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (
                error &&
                typeof error === "object" &&
                "statusCode" in error
              ) {
                const fetchError = error as unknown as FetchError;
                if (
                  fetchError.statusCode >= 400 &&
                  fetchError.statusCode < 500
                ) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            staleTime: 5 * 60 * 1000,
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache(),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
