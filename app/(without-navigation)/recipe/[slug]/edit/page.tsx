"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { RecipeForm } from "@/components/features/recipe/recipe-form/recipe-form";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { ProtectedRoute } from "@/components/layout/protected-route/protected-route";
import { useRecipeBySlug, useUpdateRecipe } from "@/hooks/use-recipes-query";
import type { Recipe } from "@/types/recipe";
import styles from "./edit.module.css";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeSlug = params.slug as string;

  const { data: recipe, isLoading, error } = useRecipeBySlug(recipeSlug);

  const updateRecipeMutation = useUpdateRecipe();

  const handleUpdateRecipe = useCallback(
    async (
      updatedRecipe: Omit<Recipe, "id" | "createdAt" | "userId" | "slug">
    ) => {
      try {
        if (!recipe) return;
        await updateRecipeMutation.mutateAsync({
          id: recipe.id,
          recipe: updatedRecipe,
        });
        router.replace(`/recipe/${recipe.slug}?from=edit`);
      } catch (error) {
        console.error("Error updating recipe:", error);
        // Error is handled by the mutation hook
      }
    },
    [recipe, updateRecipeMutation, router]
  );

  const handleCancel = useCallback(() => {
    if (recipe) {
      // Use replace to avoid adding to history stack
      router.replace(`/recipe/${recipe.slug}?from=edit`);
    } else {
      router.push("/");
    }
  }, [recipe, router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingText}>正在加载菜谱…</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>
            {error?.message || "没有找到这道菜谱"}
          </p>
          <button
            onClick={() => router.push("/")}
            className={styles.backButton}
          >
            返回菜谱
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <RecipeForm
          recipe={recipe}
          onSubmit={handleUpdateRecipe}
          onCancel={handleCancel}
          isSubmitting={updateRecipeMutation.isPending}
        />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
