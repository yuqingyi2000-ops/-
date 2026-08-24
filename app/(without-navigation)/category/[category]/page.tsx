/**
 * Category Page Component
 *
 * This page displays all recipes belonging to a specific category.
 * It's a dynamic route that accepts a category parameter from the URL.
 *
 * Usage:
 * - Accessed via: /category/[category-name]
 * - Examples: /category/breakfast, /category/dinner, /category/dessert
 *
 * Features:
 * - Fetches recipes filtered by the specified category from the database
 * - Displays recipes in a grid layout using RecipeCard components
 * - Shows loading state while fetching data
 * - Handles empty states when no recipes are found in the category
 * - Uses the same styling as the main page for consistency
 *
 * This page is part of the recipe browsing experience, allowing users
 * to explore recipes by category after selecting a category from the
 * categories section on the main page.
 */

"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { RecipeCard } from "@/components/features/recipe/recipe-card/recipe-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton/loading-skeleton";
import { ArrowLeft } from "lucide-react";
import { useRecipesByCategoryWithUser } from "@/hooks/use-recipes-query";
import { Button } from "@khamudom/lumen-ui-react";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import type { Recipe } from "@/types/recipe";
import { CATEGORY_FROM_SLUG } from "@/lib/constants";
import styles from "./category.module.css";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  const category = CATEGORY_FROM_SLUG[categorySlug];
  const { user } = useAuth();

  const {
    data: recipes = [],
    isLoading,
    error,
    isSuccess,
  } = useRecipesByCategoryWithUser(category || "");

  const handleRecipeClick = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.slug}`);
    },
    [router]
  );

  const handleBack = useCallback(() => {
    router.push("/#categories");
  }, [router]);

  const onAddRecipe = useCallback(() => {
    router.push("/add");
  }, [router]);

  // Handle invalid category slug
  if (!category) {
    return (
      <ErrorBoundary>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={`${styles.header} glass-morphism-bottom`}>
              <div className={styles.headerContent}>
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  icon={<ArrowLeft className={styles.buttonIcon} />}
                  aria-label="Back to home"
                />
                <h1 className={`${styles.mainTitle} page-header`}>
                  Category Not Found
                </h1>
              </div>
            </div>
            <div className={styles.resultsContainer}>
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>Invalid Category</h3>
                <p className={styles.emptyText}>
                  The category &ldquo;{categorySlug}&rdquo; was not found.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className={styles.addButton}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const renderContent = () => {
    if (isSuccess && recipes.length > 0) {
      return (
        <div className={styles.recipeGrid}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>
      );
    }

    // Show empty state if no recipes are found
    if (isSuccess && recipes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Image
            src="/assets/no-recipe.webp"
            alt="No recipes found"
            width={400}
            height={400}
            sizes="(max-width: 768px) 300px, 400px"
            quality={85}
            loading="lazy"
          />
          <p style={{ textAlign: "center" }}>
            Looks like this category is waiting for its first delicious
            creation!
          </p>
          {user ? (
            <Button
              onClick={onAddRecipe}
              className={styles.addButton}
              aria-label="Add new recipe"
            >
              Add Recipe
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/auth/signin")}
              className={styles.addButton}
              aria-label="Sign in to add recipe"
            >
              Sign In to Add Recipe
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  const renderResults = () => {
    // Show loading state
    if (isLoading) {
      return <LoadingSkeleton count={1} type="recipe" />;
    }

    // Show error state
    if (error) {
      return (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Error Loading Recipes</h3>
          <p className={styles.emptyText}>
            {error?.message || "Something went wrong"}
          </p>
        </div>
      );
    }

    // Show content
    return renderContent();
  };

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={`${styles.header} glass-morphism-bottom`}>
            <div className={styles.headerContent}>
              <Button
                onClick={handleBack}
                variant="ghost"
                icon={<ArrowLeft className={styles.buttonIcon} />}
                aria-label="Back"
              />
              <h1 className={`${styles.mainTitle} page-header`}>
                {category} Recipes
              </h1>
            </div>
          </div>
          <div className={styles.resultsContainer}>{renderResults()}</div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
