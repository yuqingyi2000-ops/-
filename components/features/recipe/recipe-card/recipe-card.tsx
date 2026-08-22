"use client";

import React from "react";
import { Clock, Users, Tag, User, ChefHat } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useAuth } from "@/lib/auth-context";
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
  const { user } = useAuth();
  const isMyRecipe = user && recipe.userId === user.id;

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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ width: "100%", height: "auto" }}
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
            <p className={styles.placeholderText}>No image</p>
          </div>
        )}
        <div className={styles.categoryTag}>
          <Tag className={styles.tagIcon} />
          <span className={styles.categoryText}>{recipe.category}</span>
        </div>
        {isMyRecipe && !recipe.featured && (
          <div className={styles.myRecipeBadge}>
            <User className={styles.myRecipeIcon} />
            <span className={styles.myRecipeText}>My Recipe</span>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className={styles.header}>
        <h3 className={`${styles.title} card-title`}>{recipe.title}</h3>
        <p className={styles.description}>{recipe.description}</p>
      </div>

      {/* Recipe Metrics */}
      <div className={`${styles.metaInfo} card-meta`}>
        <div className={styles.metaItem}>
          <Clock className={styles.metaIcon} />
          <span>Prep</span>
          <span>{recipe.prepTime}</span>
        </div>
        <div className={styles.metaItem}>
          <ChefHat className={styles.metaIcon} />
          <span>Cook</span>
          <span>{recipe.cookTime}</span>
        </div>
        <div className={styles.metaItem}>
          <Users className={styles.metaIcon} />
          <span>Serves</span>
          <span>{recipe.servings}</span>
        </div>
      </div>
    </div>
  );
});
