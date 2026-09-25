"use client";

import React from "react";
import { Tag } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import styles from "./recipe-card.module.css";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  priority?: boolean;
}

export const RecipeCard = React.memo(function RecipeCard({
  recipe,
  onClick,
  priority = false,
}: RecipeCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View recipe: ${recipe.title}`}
    >
      {/* Recipe Image */}
      <div className={styles.imageContainer}>
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={800}
            height={450}
            className={styles.recipeImage}
            sizes="(max-width: 719px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <Image
              src="/placeholder.svg"
              alt="Recipe placeholder"
              width={48}
              height={48}
              className={styles.placeholderIcon}
            />
            <p className={styles.placeholderText}>等一张美味照片</p>
          </div>
        )}
        <div className={styles.categoryTag}>
          <Tag className={styles.tagIcon} />
          <span className={styles.categoryText}>{recipe.category}</span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className={styles.header}>
        <h3 className={`${styles.title} card-title`}>{recipe.title}</h3>
        {recipe.description && <p className={styles.description}>{recipe.description}</p>}
      </div>
    </div>
  );
});
