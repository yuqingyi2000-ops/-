"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { RecipeCard } from "../recipe/recipe-card/recipe-card";
import { LoadingSkeleton } from "../../ui/loading-skeleton/loading-skeleton";
import type { Recipe } from "@/types/recipe";
import styles from "./featured-recipes.module.css";

const FeaturedRecipesCarousel = dynamic(
  () =>
    import("./featured-recipes-carousel").then(
      (mod) => mod.FeaturedRecipesCarousel
    ),
  { ssr: false }
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isClient ? isMobile : false;
}

interface FeaturedRecipesProps {
  recipes: Recipe[];
  isLoading: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  maxRecipes?: number;
}

export function FeaturedRecipes({
  recipes,
  isLoading,
  onRecipeClick,
  maxRecipes,
}: FeaturedRecipesProps) {
  const isMobile = useIsMobile();
  const effectiveMaxRecipes = maxRecipes ?? (isMobile ? 6 : 3);

  const featuredRecipes = recipes
    .filter((recipe) => recipe.featured)
    .sort((a, b) => {
      const orderA = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, effectiveMaxRecipes);

  return (
    <section className={styles.featuredSection}>
      <h2 className={`${styles.sectionTitle} section-header`}>Featured</h2>
      <div className={styles.decorativeLine}></div>
      {isLoading ? (
        <LoadingSkeleton count={isMobile ? 2 : 3} type="recipe" />
      ) : featuredRecipes.length > 0 ? (
        <>
          <div
            className={`${styles.recipeGrid} ${
              isMobile ? styles.recipeGridMobileHidden : ""
            }`}
          >
            {featuredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => onRecipeClick(recipe)}
                priority={index < 2}
              />
            ))}
          </div>

          {isMobile && (
            <FeaturedRecipesCarousel
              recipes={featuredRecipes}
              onRecipeClick={onRecipeClick}
              priorityCount={1}
            />
          )}
        </>
      ) : (
        <div style={{ minHeight: "64px" }}></div>
      )}
    </section>
  );
}
