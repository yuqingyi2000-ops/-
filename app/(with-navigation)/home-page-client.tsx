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
import { Button, Card } from "@khamudom/lumen-ui-react";
import type { Recipe } from "@/types/recipe";
import styles from "../home.module.css";

export function HomePageClient() {
  const router = useRouter();

  const {
    data: featuredRecipes = [],
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch,
  } = useFeaturedRecipes();

  usePageTransition({
    onTransitionStart: () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("homeScrollPosition", window.scrollY.toString());
      }
    },
    onTransitionEnd: () => {
      if (typeof window !== "undefined") {
        const savedPosition = sessionStorage.getItem("homeScrollPosition");
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          if (position > 100) {
            window.scrollTo({
              top: position,
              behavior: "auto",
            });
          }
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
    void refetch();
  }, [refetch]);

  const renderContent = () => {
    if (isFeaturedError) {
      return (
        <Card className={styles.errorStateCard}>
          <p>Failed to load featured recipes. Please try again.</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </Card>
      );
    }

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
