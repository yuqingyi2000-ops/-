"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/layout/hero/hero";
import { SearchControls } from "@/components/features/search/search-controls/search-controls";
import { FeaturedRecipes } from "@/components/features/featured-recipes/featured-recipes";
import { CategoriesSection } from "@/components/features/categories-section/categories-section";
import { Footer } from "@/components/layout/footer/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { useFeaturedRecipes } from "@/hooks/use-recipes-query";
import { usePageTransition } from "@/hooks/use-page-transition";
import { Card } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import type { Recipe } from "@/types/recipe";
import styles from "../home.module.css";

export default function RecipeBook() {
  const router = useRouter();

  const {
    data: featuredRecipes = [],
    isLoading: isFeaturedLoading,
    error: featuredError,
  } = useFeaturedRecipes();

  usePageTransition({
    onTransitionStart: () => {
      // Save current scroll position when navigating away
      if (typeof window !== "undefined") {
        sessionStorage.setItem("homeScrollPosition", window.scrollY.toString());
      }
    },
    onTransitionEnd: () => {
      // Restore scroll position when returning to the page
      if (typeof window !== "undefined") {
        const savedPosition = sessionStorage.getItem("homeScrollPosition");
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          // Only restore if it's a reasonable position (not at the very top)
          if (position > 100) {
            window.scrollTo({
              top: position,
              behavior: "auto",
            });
          }
          // Clear the saved position after restoring
          sessionStorage.removeItem("homeScrollPosition");
        }
      }
    },
  });

  const handleRecipeClick = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.slug}`);
    },
    [router]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const renderContent = () => {
    // Show error state if there's a critical error
    if (featuredError) {
      return (
        <Card className={styles.errorStateCard}>
          <p>Failed to load featured recipes. Please try again.</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </Card>
      );
    }

    // Main content - always show, let FeaturedRecipes handle its own loading state
    return (
      <>
        <FeaturedRecipes
          recipes={featuredRecipes}
          isLoading={isFeaturedLoading}
          onRecipeClick={handleRecipeClick}
        />

        <CategoriesSection />
      </>
    );
  };

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.content}>
          <HeroSection />

          <SearchControls />

          {renderContent()}

          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  );
}
