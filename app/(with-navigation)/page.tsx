import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/auth-helpers";
import { database } from "@/lib/database";
import { recipeKeys } from "@/lib/recipe-keys";
import { HomePageClient } from "./home-page-client";

export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: recipeKeys.lists(),
    queryFn: () => database.getRecipes(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
