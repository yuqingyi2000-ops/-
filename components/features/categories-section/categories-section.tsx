"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_SLUGS } from "@/lib/constants";
import {
  HandPlatter,
  Sun,
  Sandwich,
  CookingPot,
  Salad,
  CakeSlice,
  Cookie,
  Wine,
} from "lucide-react";
import styles from "./categories-section.module.css";
import { useCategoryCounts, recipeKeys } from "@/hooks/use-recipes-query";
import { useQueryClient } from "@tanstack/react-query";

// Icon mapping object
const iconComponents = {
  HandPlatter,
  Sun,
  Sandwich,
  CookingPot,
  Salad,
  CakeSlice,
  Cookie,
  Wine,
};

interface CategoriesSectionProps {
  title?: string;
}

export function CategoriesSection({
  title = "Categories",
}: CategoriesSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categoryCounts = {}, isLoading } = useCategoryCounts();
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const handleCategoryClick = useCallback(
    (category: string) => {
      // Set loading state for immediate feedback
      setLoadingCategory(category);

      // Navigate to the category page using SEO-friendly slug
      const slug = CATEGORY_SLUGS[category as keyof typeof CATEGORY_SLUGS];
      router.push(`/category/${slug}`);
    },
    [router]
  );

  const handleCategoryHover = useCallback(
    (category: string) => {
      // Preload the category data on hover
      queryClient.prefetchQuery({
        queryKey: recipeKeys.category(category),
        queryFn: async () => {
          const { database } = await import("@/lib/database");
          const { supabase } = await import("@/lib/supabase");
          return database.getRecipesByCategory(supabase, category);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return (
    <section id="categories" className={styles.categoriesSection}>
      <h2 className={`${styles.sectionTitle} section-header`}>{title}</h2>
      <div className={styles.decorativeLine}></div>
      <div className={styles.categoriesGrid}>
        {CATEGORIES.map((category) => {
          const IconComponent =
            iconComponents[
              CATEGORY_ICONS[category] as keyof typeof iconComponents
            ];
          const count = categoryCounts[category] || 0;
          const isCardLoading = loadingCategory === category;

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => handleCategoryHover(category)}
              className={`${styles.categoryCard} category-card ${
                isCardLoading ? styles.loading : ""
              }`}
              type="button"
              aria-label={`View ${category} recipes`}
              disabled={isCardLoading}
            >
              <IconComponent
                className={`${styles.categoryIcon} ${
                  isCardLoading ? styles.loadingIcon : ""
                }`}
              />
              <span className={styles.categoryTitle}>{category}</span>
              <span className={`${styles.categoryCount} card-meta`}>
                {isLoading ? "..." : `${count} recipe${count === 1 ? "" : "s"}`}
              </span>
              {isCardLoading && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
