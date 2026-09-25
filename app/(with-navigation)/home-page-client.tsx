"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchControls } from "@/components/features/search/search-controls/search-controls";
import { RecipeCard } from "@/components/features/recipe/recipe-card/recipe-card";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { useRecipes } from "@/hooks/use-recipes-query";
import { usePageTransition } from "@/hooks/use-page-transition";
import { Button, Card } from "@khamudom/lumen-ui-react";
import { UtensilsCrossed } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import styles from "../home.module.css";

export function HomePageClient() {
  const router = useRouter();

  const {
    data: recipes = [],
    isLoading,
    isError,
    refetch,
  } = useRecipes();

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
    if (isError) {
      return (
        <Card className={styles.errorStateCard}>
          <p>菜谱暂时没有加载出来，请稍后再试。</p>
          <Button onClick={handleRetry}>重新加载</Button>
        </Card>
      );
    }

    if (isLoading) {
      return <div className={styles.loading}>正在翻开饭饭簿…</div>;
    }

    if (recipes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <UtensilsCrossed aria-hidden="true" />
          <h2>饭饭簿还是空的</h2>
          <p>记录第一道喜欢的菜吧。</p>
          <Button onClick={() => router.push("/add")}>添加菜谱</Button>
        </div>
      );
    }

    return (
      <section className={styles.recipeSection}>
        <div className={styles.sectionHeading}>
          <h2>我们的菜谱</h2>
          <span>{recipes.length} 道</span>
        </div>
        <div className={styles.recipeGrid}>
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              priority={index < 4}
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.content}>
          <header className={styles.hero}>
            <div className={styles.eyebrow}>OUR LITTLE RECIPE BOOK</div>
            <h1>饭饭簿</h1>
            <p>今天也要好好吃饭呀 ♡</p>
          </header>
          <SearchControls />
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
}
