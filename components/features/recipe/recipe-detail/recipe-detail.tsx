"use client";

import React from "react";
import { ArrowLeft, Clock, Users, Edit, Trash2, ChefHat } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { Recipe } from "@/types/recipe";
import styles from "./recipe-detail.module.css";
import Image from "next/image";
import { Button } from "@khamudom/lumen-ui-react";

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeDetail({
  recipe,
  onBack,
  onEdit,
  onDelete,
}: RecipeDetailProps) {
  const { user } = useAuth();
  const isOwner = user && recipe.userId === user.id;

  // Helper function to render ingredients (grouped or flat)
  const renderIngredients = () => {
    if (recipe.ingredientGroups && recipe.ingredientGroups.length > 0) {
      return (
        <div className={styles.ingredientGroups}>
          {recipe.ingredientGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.ingredientGroup}>
              <h4 className={styles.groupTitle}>{group.name}</h4>
              <ul className={styles.ingredientsList}>
                {group.ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredientItem}>
                    <div className={styles.ingredientBullet}></div>
                    <span className={styles.ingredientText}>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    // Fallback to old ingredients array
    return (
      <ul className={styles.ingredientsList}>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index} className={styles.ingredientItem}>
            <div className={styles.ingredientBullet}></div>
            <span className={styles.ingredientText}>{ingredient}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Helper function to render instructions (grouped or flat)
  const renderInstructions = () => {
    if (recipe.instructionGroups && recipe.instructionGroups.length > 0) {
      return (
        <div className={styles.instructionGroups}>
          {recipe.instructionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.instructionGroup}>
              <h4 className={styles.groupTitle}>{group.name}</h4>
              <ol className={styles.instructionsList}>
                {group.instructions.map((instruction, index) => (
                  <li key={index} className={styles.instructionItem}>
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <span className={styles.instructionText}>
                      {instruction}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      );
    }

    // Fallback to old instructions array
    return (
      <ol className={styles.instructionsList}>
        {recipe.instructions.map((instruction, index) => (
          <li key={index} className={styles.instructionItem}>
            <div className={styles.stepNumber}>{index + 1}</div>
            <span className={styles.instructionText}>{instruction}</span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Hero Section */}
        <div className={`${styles.headerControls} glass-morphism-bottom`}>
          <div className={styles.headerControlsContent}>
            <Button
              onClick={onBack}
              variant="ghost"
              icon={<ArrowLeft className={styles.buttonIcon} />}
              aria-label="返回"
            />
            <h1 className={`${styles.recipeTitle} section-header`}>
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwner && (
          <div className={styles.actionButtons}>
            <Button
              onClick={onEdit}
              variant="outline"
              icon={<Edit className={styles.buttonIcon} />}
              aria-label="编辑菜谱"
            />
            <Button
              onClick={onDelete}
              variant="outline"
              icon={<Trash2 className={styles.buttonIcon} />}
              aria-label="删除菜谱"
            />
          </div>
        )}

        {/* Recipe Image */}
        {recipe.image && (
          <div className={styles.heroImageContainer}>
            <Image
              src={recipe.image}
              alt={recipe.title}
              width={400}
              height={300}
              className={styles.heroImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              quality={85}
              priority
            />
          </div>
        )}

        {/* Recipe Description */}
        <div className={styles.recipeHeader}>
          <div className={styles.infoCard} style={{ padding: "1rem" }}>
            <p className={styles.recipeDescription}>{recipe.description}</p>
          </div>
        </div>

        {/* Recipe Info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <Clock className={styles.infoIcon} />
              <div className={styles.infoLabel}>准备时间</div>
              <div className={styles.infoValue}>{recipe.prepTime}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <ChefHat className={styles.infoIcon} />
              <div className={styles.infoLabel}>烹饪时间</div>
              <div className={styles.infoValue}>{recipe.cookTime}</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <Users className={styles.infoIcon} />
              <div className={styles.infoLabel}>份量</div>
              <div className={styles.infoValue}>{recipe.servings}</div>
            </div>
          </div>
        </div>

        {/* Ingredients and Instructions */}
        <div className={styles.mainContent}>
          {/* Ingredients */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.sectionTitle}>所需材料</h3>
              <div className={styles.sectionLine}></div>
            </div>
            <div className={styles.cardContent}>{renderIngredients()}</div>
          </div>

          {/* Instructions */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.sectionTitle}>制作步骤</h3>
              <div className={styles.sectionLine}></div>
            </div>
            <div className={styles.cardContent}>{renderInstructions()}</div>
          </div>
        </div>
        <div className={styles.menuAction}>
          <Button disabled>＋ 加入今日菜单（即将开放）</Button>
        </div>
      </div>
    </div>
  );
}
