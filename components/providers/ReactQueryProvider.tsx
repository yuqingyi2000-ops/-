"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { recipeKeys } from "@/lib/recipe-keys";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 3,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          refetchOnMount: false,
        },
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryAuthSync />
      {children}
    </QueryClientProvider>
  );
}

function ReactQueryAuthSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Invalidate queries but don't force immediate refetch
        queryClient.invalidateQueries({ queryKey: recipeKeys.all });
        queryClient.invalidateQueries({ queryKey: ["category-counts"] });

        // Only refetch category counts immediately as they're critical for navigation
        queryClient.refetchQueries({ queryKey: ["category-counts"] });
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [queryClient]);
  return null;
}
