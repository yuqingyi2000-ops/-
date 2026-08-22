"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper/modules";
import { RecipeCard } from "../recipe/recipe-card/recipe-card";
import type { Recipe } from "@/types/recipe";
import styles from "./featured-recipes.module.css";

import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/free-mode";

interface FeaturedRecipesCarouselProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  priorityCount?: number;
}

export function FeaturedRecipesCarousel({
  recipes,
  onRecipeClick,
  priorityCount = 0,
}: FeaturedRecipesCarouselProps) {
  return (
    <div className={styles.recipeCarousel}>
      <Swiper
        modules={[Mousewheel, FreeMode]}
        spaceBetween={24}
        slidesPerView="auto"
        freeMode={{
          enabled: true,
          sticky: true,
          momentumBounce: false,
          momentumRatio: 0.4,
          momentumVelocityRatio: 0.4,
          minimumVelocity: 0.02,
        }}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1,
        }}
        grabCursor={true}
        resistance={true}
        resistanceRatio={0.85}
        touchStartPreventDefault={false}
        touchMoveStopPropagation={false}
        preventClicks={true}
        preventClicksPropagation={true}
        threshold={10}
        shortSwipes={true}
        longSwipes={true}
        longSwipesRatio={0.5}
        longSwipesMs={300}
        followFinger={true}
        className={styles.swiperContainer}
      >
        {recipes.map((recipe, index) => (
          <SwiperSlide
            key={recipe.id}
            className={styles.recipeCarouselItem}
          >
            <RecipeCard
              recipe={recipe}
              onClick={() => onRecipeClick(recipe)}
              priority={index < priorityCount}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
