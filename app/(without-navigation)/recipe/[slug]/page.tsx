"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { AlertDialog, Button } from "@khamudom/lumen-ui-react";
import { RecipeDetail } from "@/components/features/recipe/recipe-detail/recipe-detail";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner/loading-spinner";
import { useRecipeBySlug, useDeleteRecipe } from "@/hooks/use-recipes-query";

function RecipeDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const recipeSlug = params.slug as string;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: recipe, isLoading, error } = useRecipeBySlug(recipeSlug);

  const deleteRecipeMutation = useDeleteRecipe();

  const handleEdit = useCallback(() => {
    if (recipe) {
      router.push(`/recipe/${recipe.slug}/edit`);
    }
  }, [recipe, router]);

  const handleDeleteRequest = useCallback(() => {
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!recipe) return;
    try {
      await deleteRecipeMutation.mutateAsync(recipe.id);
      setIsDeleteOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  }, [recipe, deleteRecipeMutation, router]);

  const handleBack = useCallback(() => {
    const fromEdit = searchParams.get("from") === "edit";

    if (fromEdit) {
      router.push("/");
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div style={{ padding: "10%" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <p>Failed to load recipe. Please try again.</p>
        <Button onClick={handleBack}>Back to Recipes</Button>
      </div>
    );
  }

  return (
    recipe && (
      <>
        <RecipeDetail
          recipe={recipe}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
        <AlertDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete recipe?"
          description="Are you sure you want to delete this recipe? This action cannot be undone."
          destructive
          actionLabel="Delete"
          cancelLabel="Cancel"
          onAction={handleDeleteConfirm}
        />
      </>
    )
  );
}

export default function RecipeDetailPage() {
  return (
    <ErrorBoundary>
      <RecipeDetailContent />
    </ErrorBoundary>
  );
}
