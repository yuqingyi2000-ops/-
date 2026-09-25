/**
 * RecipeForm Component
 *
 * A comprehensive form component for creating and editing recipes. Features include:
 * - Manual recipe entry with all standard fields (title, ingredients, instructions, etc.)
 * - AI-powered recipe extraction from images
 * - Image upload and preview functionality
 * - Dynamic ingredient and instruction management (add/remove fields)
 * - Ingredient grouping functionality
 * - Admin-only featured recipe toggle
 * - Form validation and submission handling
 */

"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  ImageIcon,
  ArrowLeft,
  FolderPlus,
  //Globe,
} from "lucide-react";
// TODO: Import MultiImageAnalysisResponse when we add URL extraction
import type {
  Recipe,
  IngredientGroup,
  InstructionGroup,
} from "@/types/recipe";
// import { URLRecipeExtractor } from "@/components/url-recipe-extractor/url-recipe-extractor";
import styles from "./recipe-form.module.css";
import Image from "next/image";
import {
  Button,
  Input,
  Select,
  Textarea,
  Toast,
} from "@khamudom/lumen-ui-react";
import {
  uploadImageToSupabase,
  deleteImageFromSupabase,
  isBase64Image,
} from "@/lib/image-upload";

const CATEGORY_OPTIONS = [
  { value: "荤菜", label: "荤菜" },
  { value: "素菜", label: "素菜" },
  { value: "汤", label: "汤" },
  { value: "主食", label: "主食" },
  { value: "早餐", label: "早餐" },
  { value: "快手菜", label: "快手菜" },
  { value: "甜品", label: "甜品" },
  { value: "饮品", label: "饮品" },
  { value: "其他", label: "其他" },
];

interface RecipeFormProps {
  recipe?: Recipe | null;
  onSubmit: (
    recipe: Omit<Recipe, "id" | "createdAt" | "userId" | "slug">
  ) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RecipeFormProps) {
  // Initialize ingredient groups from existing recipe or create default structure
  const initializeIngredientGroups = (): IngredientGroup[] => {
    if (recipe?.ingredientGroups && recipe.ingredientGroups.length > 0) {
      return recipe.ingredientGroups;
    }

    // If recipe has old ingredients array, convert to a default group
    if (recipe?.ingredients && recipe.ingredients.length > 0) {
      return [
        {
          name: "材料",
          ingredients: recipe.ingredients.filter((ing) => ing.trim()),
          sortOrder: 0,
        },
      ];
    }

    // Default empty group
    return [
      {
        name: "材料",
        ingredients: [""],
        sortOrder: 0,
      },
    ];
  };

  // Initialize instruction groups from existing recipe or create default structure
  const initializeInstructionGroups = (): InstructionGroup[] => {
    if (recipe?.instructionGroups && recipe.instructionGroups.length > 0) {
      return recipe.instructionGroups;
    }

    // If recipe has old instructions array, convert to a default group
    if (recipe?.instructions && recipe.instructions.length > 0) {
      return [
        {
          name: "做法",
          instructions: recipe.instructions.filter((inst) => inst.trim()),
          sortOrder: 0,
        },
      ];
    }

    // Default empty group
    return [
      {
        name: "做法",
        instructions: [""],
        sortOrder: 0,
      },
    ];
  };

  const [formData, setFormData] = useState({
    title: recipe?.title || "",
    description: recipe?.description || "",
    ingredients: recipe?.ingredients || [""], // Keep for backward compatibility
    ingredientGroups: initializeIngredientGroups(),
    instructions: recipe?.instructions || [""], // Keep for backward compatibility
    instructionGroups: initializeInstructionGroups(),
    prepTime: recipe?.prepTime || "",
    cookTime: recipe?.cookTime || "",
    servings: recipe?.servings || "",
    category: recipe?.category || "",
    image: recipe?.image || "",
    imagePath: recipe?.imagePath || "",
    featured: recipe?.featured || false,
    featuredOrder: recipe?.featuredOrder || undefined,
  });

  // const [showURLExtractor, setShowURLExtractor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category) return;

    // Filter out empty ingredients from all groups
    const filteredGroups = formData.ingredientGroups
      .map((group) => ({
        ...group,
        ingredients: group.ingredients.filter((ing) => ing.trim()),
      }))
      .filter((group) => group.ingredients.length > 0);

    // Filter out empty instructions from all groups
    const filteredInstructionGroups = formData.instructionGroups
      .map((group) => ({
        ...group,
        instructions: group.instructions.filter((inst) => inst.trim()),
      }))
      .filter((group) => group.instructions.length > 0);

    // Flatten ingredients for backward compatibility
    const flattenedIngredients = filteredGroups.flatMap(
      (group) => group.ingredients
    );

    // Flatten instructions for backward compatibility
    const flattenedInstructions = filteredInstructionGroups.flatMap(
      (group) => group.instructions
    );

    onSubmit({
      ...formData,
      ingredients: flattenedIngredients,
      ingredientGroups: filteredGroups,
      instructions: flattenedInstructions,
      instructionGroups: filteredInstructionGroups,
    });
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formToast, setFormToast] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFormToast("请选择图片文件");
      return;
    }

    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setFormToast("图片大小不能超过 20MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      // Delete old image from storage if it exists
      if (formData.imagePath && !isBase64Image(formData.image)) {
        await deleteImageFromSupabase(formData.imagePath);
      }

      // Upload new image to Supabase storage
      const uploadResult = await uploadImageToSupabase(file);

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      setFormData((prev) => ({
        ...prev,
        image: uploadResult.url,
        imagePath: uploadResult.path,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setFormToast("图片上传失败，请再试一次");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = async () => {
    try {
      // Delete image from storage if it exists and is not base64
      if (formData.imagePath && !isBase64Image(formData.image)) {
        await deleteImageFromSupabase(formData.imagePath);
      }

      setFormData((prev) => ({ ...prev, image: "", imagePath: "" }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // Still remove from form even if storage deletion fails
      setFormData((prev) => ({ ...prev, image: "", imagePath: "" }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Ingredient group management
  const addIngredientGroup = () => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: [
        ...prev.ingredientGroups,
        {
          name: `材料组 ${prev.ingredientGroups.length + 1}`,
          ingredients: [""],
          sortOrder: prev.ingredientGroups.length,
        },
      ],
    }));
  };

  const removeIngredientGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: prev.ingredientGroups.filter(
        (_, i) => i !== groupIndex
      ),
    }));
  };

  const updateIngredientGroupName = (groupIndex: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: prev.ingredientGroups.map((group, i) =>
        i === groupIndex ? { ...group, name } : group
      ),
    }));
  };

  const addIngredientToGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: prev.ingredientGroups.map((group, i) =>
        i === groupIndex
          ? { ...group, ingredients: [...group.ingredients, ""] }
          : group
      ),
    }));
  };

  const removeIngredientFromGroup = (
    groupIndex: number,
    ingredientIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: prev.ingredientGroups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              ingredients: group.ingredients.filter(
                (_, j) => j !== ingredientIndex
              ),
            }
          : group
      ),
    }));
  };

  const updateIngredientInGroup = (
    groupIndex: number,
    ingredientIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredientGroups: prev.ingredientGroups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              ingredients: group.ingredients.map((ing, j) =>
                j === ingredientIndex ? value : ing
              ),
            }
          : group
      ),
    }));
  };

  // Instruction group management
  const addInstructionGroup = () => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: [
        ...prev.instructionGroups,
        {
          name: `步骤组 ${prev.instructionGroups.length + 1}`,
          instructions: [""],
          sortOrder: prev.instructionGroups.length,
        },
      ],
    }));
  };

  const removeInstructionGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: prev.instructionGroups.filter(
        (_, i) => i !== groupIndex
      ),
    }));
  };

  const updateInstructionGroupName = (groupIndex: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: prev.instructionGroups.map((group, i) =>
        i === groupIndex ? { ...group, name } : group
      ),
    }));
  };

  const addInstructionToGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: prev.instructionGroups.map((group, i) =>
        i === groupIndex
          ? { ...group, instructions: [...group.instructions, ""] }
          : group
      ),
    }));
  };

  const removeInstructionFromGroup = (
    groupIndex: number,
    instructionIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: prev.instructionGroups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              instructions: group.instructions.filter(
                (_, j) => j !== instructionIndex
              ),
            }
          : group
      ),
    }));
  };

  const updateInstructionInGroup = (
    groupIndex: number,
    instructionIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      instructionGroups: prev.instructionGroups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              instructions: group.instructions.map((inst, j) =>
                j === instructionIndex ? value : inst
              ),
            }
          : group
      ),
    }));
  };

  // const handleURLExtractionComplete = (recipeData: AIRecipeAnalysisResult) => {
  //   setFormData({
  //     title: recipeData.title || "",
  //     description: recipeData.description || "",
  //     ingredients: recipeData.ingredients || [""],
  //     instructions: recipeData.instructions || [""],
  //     prepTime: recipeData.prepTime || "",
  //     cookTime: recipeData.cookTime || "",
  //     servings: recipeData.servings || "",
  //     category: recipeData.category || "",
  //     image: recipeData.image || formData.image,
  //     featured: formData.featured, // Preserve the featured setting
  //   });
  //   setShowURLExtractor(false);
  // };

  // const handleURLExtractorCancel = () => {
  //   setShowURLExtractor(false);
  // };

  // Show URL extractor if enabled
  // if (showURLExtractor) {
  //   return (
  //     <URLRecipeExtractor
  //       onExtractionComplete={handleURLExtractionComplete}
  //       onCancel={handleURLExtractorCancel}
  //     />
  //   );
  // }

  const CardLine = () => {
    return <div className={styles.decorativeLine}></div>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {formToast && (
          <Toast
            variant="danger"
            title="上传失败"
            description={formToast}
            onClose={() => setFormToast(null)}
          />
        )}
        {/* Hero Section */}
        <div className={styles.header}>
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            icon={<ArrowLeft />}
            aria-label="返回"
          />
          <h1 className={`${styles.title} section-header`}>
            {recipe ? "编辑菜谱" : "添加菜谱"}
          </h1>
          <div className={styles.spacer}></div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Recipe Image */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>菜品图片</h3>
              <CardLine />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.imageUploadSection}>
                {formData.image ? (
                  <div className={styles.imagePreviewContainer}>
                    <div className={styles.imagePreviewWrapper}>
                      <Image
                        src={formData.image || "/placeholder.svg"}
                        alt="菜品图片预览"
                        fill
                        className={styles.imagePreview}
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className={styles.removeImageButton}
                    >
                      <X className={styles.buttonIcon} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <ImageIcon className={styles.uploadIcon} />
                    <p className={styles.uploadText}>还没有选择图片</p>
                  </div>
                )}
                <div className={styles.uploadControls}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.hiddenInput}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    loading={isUploadingImage}
                    icon={
                      !isUploadingImage ? (
                        <Upload className={styles.buttonIcon} />
                      ) : undefined
                    }
                  >
                    {isUploadingImage
                      ? "正在上传…"
                      : formData.image
                      ? "更换图片"
                      : "选择图片"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>菜谱信息</h3>
              <CardLine />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.inputGrid}>
                <Input
                  id="title"
                  label="菜名 *"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="例如：番茄炒蛋"
                  className={styles.inputGroup}
                  required
                />
                <Select
                  id="category"
                  label="分类 *"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="请选择分类"
                  options={CATEGORY_OPTIONS}
                  className={styles.inputGroup}
                  required
                />
              </div>

              <Textarea
                id="description"
                label="简单介绍"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="写一句这道菜的小故事（选填）"
                className={styles.inputGroup}
              />

              <div className={styles.metaGrid}>
                <Input
                  id="prepTime"
                  label="准备时间（选填）"
                  value={formData.prepTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prepTime: e.target.value,
                    }))
                  }
                  placeholder="例如：10分钟"
                  className={styles.inputGroup}
                />
                <Input
                  id="cookTime"
                  label="烹饪时间（选填）"
                  value={formData.cookTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cookTime: e.target.value,
                    }))
                  }
                  placeholder="例如：20分钟"
                  className={styles.inputGroup}
                />
                <Input
                  id="servings"
                  type="text"
                  label="份量（选填）"
                  value={formData.servings}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      servings: e.target.value,
                    }))
                  }
                  placeholder="例如：2人份"
                  className={styles.inputGroup}
                />
              </div>
            </div>
          </div>

          {/* Ingredients - Grouped with add/remove functionality */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>所需材料</h3>
              <CardLine />
            </div>
            <div className={styles.cardContent}>
              {formData.ingredientGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.ingredientGroup}>
                  <div className={styles.groupHeader}>
                    <input
                      value={group.name}
                      onChange={(e) =>
                        updateIngredientGroupName(groupIndex, e.target.value)
                      }
                      placeholder="材料分组名称"
                      className={styles.groupNameInput}
                    />
                    {formData.ingredientGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredientGroup(groupIndex)}
                        className={styles.removeGroupButton}
                      >
                        <X className={styles.buttonIcon} />
                      </button>
                    )}
                  </div>

                  {group.ingredients.map((ingredient, ingredientIndex) => (
                    <div key={ingredientIndex} className={styles.listItem}>
                      <input
                        value={ingredient}
                        onChange={(e) =>
                          updateIngredientInGroup(
                            groupIndex,
                            ingredientIndex,
                            e.target.value
                          )
                        }
                        placeholder={`材料 ${ingredientIndex + 1}，例如：鸡蛋 2个`}
                        className={styles.input}
                      />
                      {group.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeIngredientFromGroup(
                              groupIndex,
                              ingredientIndex
                            )
                          }
                          className={styles.removeButton}
                        >
                          <X className={styles.buttonIcon} />
                        </button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() => addIngredientToGroup(groupIndex)}
                    variant="outline"
                    className={styles.addIngredientButton}
                    icon={<Plus className={styles.buttonIcon} />}
                  >
                    ＋ 添加材料
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={addIngredientGroup}
                variant="outline"
                className={styles.addGroupButton}
                icon={<FolderPlus className={styles.buttonIcon} />}
              >
                添加材料分组
              </Button>
            </div>
          </div>

          {/* Instructions - Grouped with add/remove functionality */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>制作步骤</h3>
              <CardLine />
            </div>
            <div className={styles.cardContent}>
              {formData.instructionGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.ingredientGroup}>
                  <div className={styles.groupHeader}>
                    <input
                      value={group.name}
                      onChange={(e) =>
                        updateInstructionGroupName(groupIndex, e.target.value)
                      }
                      placeholder="步骤分组名称"
                      className={styles.groupNameInput}
                    />
                    {formData.instructionGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstructionGroup(groupIndex)}
                        className={styles.removeGroupButton}
                      >
                        <X className={styles.buttonIcon} />
                      </button>
                    )}
                  </div>

                  {group.instructions.map((instruction, instructionIndex) => (
                    <div key={instructionIndex} className={styles.listItem}>
                      <div className={styles.stepNumber}>
                        {instructionIndex + 1}
                      </div>
                      <textarea
                        value={instruction}
                        onChange={(e) =>
                          updateInstructionInGroup(
                            groupIndex,
                            instructionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`第 ${instructionIndex + 1} 步…`}
                        className={styles.textarea}
                      />
                      {group.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeInstructionFromGroup(
                              groupIndex,
                              instructionIndex
                            )
                          }
                          className={styles.removeButton}
                        >
                          <X className={styles.buttonIcon} />
                        </button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() => addInstructionToGroup(groupIndex)}
                    variant="outline"
                    className={styles.addIngredientButton}
                    icon={<Plus className={styles.buttonIcon} />}
                  >
                    ＋ 添加步骤
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={addInstructionGroup}
                variant="outline"
                className={styles.addGroupButton}
                icon={<FolderPlus className={styles.buttonIcon} />}
              >
                添加步骤分组
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className={styles.submitButtons}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting
                ? recipe
                  ? "正在保存…"
                  : "正在保存…"
                : recipe
                ? "保存修改"
                : "保存到饭饭簿"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
