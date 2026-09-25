"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchRecipes } from "@/hooks/use-recipes-query";
import { SearchControls } from "@/components/features/search/search-controls/search-controls";
import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";
import { RecipeCard } from "@/components/features/recipe/recipe-card/recipe-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner/loading-spinner";
import type { Recipe } from "@/types/recipe";
import styles from "./search-results.module.css";

export function SearchResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery;

  const {
    data: recipes = [],
    isLoading,
    error,
  } = useSearchRecipes(query);

  const handleRecipeClick = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.slug}`);
    },
    [router]
  );

  const renderContent = () => {
    if (recipes.length > 0) {
      return (
        <div className={styles.resultsGrid}>
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

    return (
      <div className={styles.noResults}>
        <h2>没有找到相关菜谱</h2>
        <p>
          {query
            ? `没有找到“${query}”，换个关键词试试看。`
            : "输入菜名、材料或分类开始搜索。"}
        </p>
      </div>
    );
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            marginTop: "30%",
          }}
        >
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.noResults}>
          <h2>搜索遇到问题</h2>
          <p>{error.message || "请稍后再试"}</p>
        </div>
      );
    }

    return renderContent();
  };

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.searchHeader}>
            <h1 className="section-header">“{query}”的搜索结果</h1>
          </div>

          <SearchControls initialQuery={query} />

          {renderResults()}
        </div>
      </div>
    </ErrorBoundary>
  );
}
