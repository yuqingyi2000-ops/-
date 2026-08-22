"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/lib/constants";
import type { Recipe } from "@/types/recipe";
import { recipeKeys } from "@/lib/recipe-keys";

export { recipeKeys };

// Hook to get all recipes
export function useRecipes() {
  return useQuery({
    queryKey: recipeKeys.lists(),
    queryFn: async () => {
      const data = await database.getRecipes(supabase);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to get featured recipes
export function useFeaturedRecipes() {
  return useQuery({
    queryKey: recipeKeys.featured(),
    queryFn: async () => {
      const data = await database.getFeaturedRecipes(supabase);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Hook to get a single recipe
export function useRecipe(id: string) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => database.getRecipe(supabase, id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

// Hook to get a single recipe by slug
export function useRecipeBySlug(slug: string) {
  return useQuery({
    queryKey: recipeKeys.detail(slug),
    queryFn: () => database.getRecipeBySlug(supabase, slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

// Hook to search recipes
export function useSearchRecipes(query: string) {
  return useQuery({
    queryKey: recipeKeys.search(query),
    queryFn: () => database.searchRecipes(supabase, query),
    enabled: !!query.trim(), // Only run if query exists and is not empty
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
}

// Hook to get recipes by category
export function useRecipesByCategory(category: string) {
  return useQuery({
    queryKey: recipeKeys.category(category),
    queryFn: () => database.getRecipesByCategory(supabase, category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// User-aware recipes by category hook for correct cache per user
export function useRecipesByCategoryWithUser(category: string) {
  return useQuery({
    queryKey: recipeKeys.category(category),
    queryFn: () => database.getRecipesByCategory(supabase, category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to create a recipe
export function useCreateRecipe(options?: {
  onSuccess?: (recipe: Recipe) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      recipe: Omit<Recipe, "id" | "createdAt" | "userId" | "slug">
    ) => database.createRecipe(supabase, recipe),
    onSuccess: (newRecipe) => {
      // Add the new recipe to the cache immediately
      queryClient.setQueryData(recipeKeys.detail(newRecipe.id), newRecipe);

      // Remove category counts from cache to force fresh fetch
      queryClient.removeQueries({ queryKey: ["category-counts"] });

      // Invalidate all recipe-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });

      // Force refetch category counts immediately
      queryClient.refetchQueries({ queryKey: ["category-counts"] });

      if (newRecipe.featured) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.featured() });
      }

      // Call the optional onSuccess callback
      options?.onSuccess?.(newRecipe);
    },
    onError: (error) => {
      console.error("Error creating recipe:", error);
      throw new Error(ERROR_MESSAGES.CREATE_RECIPE);
    },
  });
}

// Hook to update a recipe
export function useUpdateRecipe(options?: {
  onSuccess?: (recipe: Recipe) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      recipe,
    }: {
      id: string;
      recipe: Partial<Omit<Recipe, "id" | "createdAt" | "userId" | "slug">>;
    }) => database.updateRecipe(supabase, id, recipe),
    onSuccess: (updatedRecipe) => {
      // Update the recipe in cache immediately
      queryClient.setQueryData(
        recipeKeys.detail(updatedRecipe.id),
        updatedRecipe
      );

      // Remove category counts from cache to force fresh fetch
      queryClient.removeQueries({ queryKey: ["category-counts"] });

      // Invalidate all recipe-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.featured() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.details() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });

      // Force refetch category counts immediately
      queryClient.refetchQueries({ queryKey: ["category-counts"] });

      // Call the optional onSuccess callback
      options?.onSuccess?.(updatedRecipe);
    },
    onError: (error) => {
      console.error("Error updating recipe:", error);
      throw new Error(ERROR_MESSAGES.UPDATE_RECIPE);
    },
  });
}

// Hook to delete a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => database.deleteRecipe(supabase, id),
    onSuccess: (_, deletedId) => {
      // Remove the recipe from cache immediately
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });

      // Remove category counts from cache to force fresh fetch
      queryClient.removeQueries({ queryKey: ["category-counts"] });

      // Invalidate all recipe-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.featured() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });

      // Force refetch category counts immediately
      queryClient.refetchQueries({ queryKey: ["category-counts"] });
    },
    onError: (error) => {
      console.error("Error deleting recipe:", error);
      throw new Error(ERROR_MESSAGES.DELETE_RECIPE);
    },
  });
}

// Hook to get category recipe counts efficiently
export function useCategoryCounts() {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const response = await fetch("/api/category-recipe-counts", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch category counts");
      }
      return response.json() as Promise<Record<string, number>>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// User-aware recipes hook for correct cache per user
export function useRecipesWithUser() {
  return useQuery({
    queryKey: recipeKeys.all,
    queryFn: () => database.getRecipes(supabase),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
