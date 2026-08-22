/**
 * Database Operations Layer
 *
 * This file provides a centralized interface for all database operations related to recipes.
 * It abstracts the Supabase client interactions and provides a clean API for the application
 * to perform CRUD operations on recipes.
 *
 * Key Features:
 * - Recipe CRUD operations (Create, Read, Update, Delete)
 * - Ingredient grouping support with separate tables
 * - Search functionality with fallback mechanisms
 * - Category-based filtering
 * - Admin-specific operations for featured recipes
 * - Automatic data normalization between database and application formats
 * - Row Level Security (RLS) policy enforcement
 *
 * Authentication & Authorization:
 * - Uses Supabase RLS policies for automatic filtering
 * - Featured recipes are visible to everyone
 * - User recipes are only visible to the owner
 * - Admin users can create featured recipes
 *
 * Usage:
 * - Import the database object and use its methods
 * - Pass the Supabase client instance to each method
 * - All methods return normalized Recipe objects
 */

import type { Recipe, IngredientGroup, InstructionGroup } from "@/types/recipe";
import { SupabaseClient } from "@supabase/supabase-js";

export const database = {
  // Get recipes based on user authentication status
  // RLS policies automatically filter based on user permissions
  async getRecipes(supabase: SupabaseClient): Promise<Recipe[]> {
    // Let RLS policies handle the filtering automatically
    // Featured recipes are visible to everyone
    // User recipes are only visible to the owner
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch recipes");

    // Fetch ingredient groups and instruction groups for each recipe
    const recipesWithGroups = await Promise.all(
      data.map(async (recipe) => {
        const ingredientGroups = await this.getIngredientGroups(
          supabase,
          recipe.id
        );
        const instructionGroups = await this.getInstructionGroups(
          supabase,
          recipe.id
        );
        return { ...recipe, ingredientGroups, instructionGroups };
      })
    );

    return recipesWithGroups.map(normalizeRecipe);
  },

  // Get user's own recipes only
  // Requires authentication and filters by user_id
  async getUserRecipes(supabase: SupabaseClient): Promise<Recipe[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch user recipes");

    // Fetch ingredient groups and instruction groups for each recipe
    const recipesWithGroups = await Promise.all(
      data.map(async (recipe) => {
        const ingredientGroups = await this.getIngredientGroups(
          supabase,
          recipe.id
        );
        const instructionGroups = await this.getInstructionGroups(
          supabase,
          recipe.id
        );
        return { ...recipe, ingredientGroups, instructionGroups };
      })
    );

    return recipesWithGroups.map(normalizeRecipe);
  },

  // Get featured recipes (visible to all users)
  // Card list payload only — skip N+1 ingredient/instruction group fetches
  async getFeaturedRecipes(supabase: SupabaseClient): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("featured", true)
      .order("featured_order", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to fetch featured recipes");

    return (data ?? []).map((recipe) =>
      normalizeRecipe({
        ...recipe,
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
        ingredientGroups: [],
        instructionGroups: [],
      })
    );
  },

  // Get a single recipe by ID
  // Returns null if recipe doesn't exist or user doesn't have access
  async getRecipe(
    supabase: SupabaseClient,
    id: string
  ): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw new Error("Failed to fetch recipe");
    }

    if (data) {
      const ingredientGroups = await this.getIngredientGroups(
        supabase,
        data.id
      );
      const instructionGroups = await this.getInstructionGroups(
        supabase,
        data.id
      );
      return normalizeRecipe({ ...data, ingredientGroups, instructionGroups });
    }

    return null;
  },

  // Get a single recipe by slug
  // Returns null if recipe doesn't exist or user doesn't have access
  async getRecipeBySlug(
    supabase: SupabaseClient,
    slug: string
  ): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw new Error("Failed to fetch recipe");
    }

    if (data) {
      const ingredientGroups = await this.getIngredientGroups(
        supabase,
        data.id
      );
      const instructionGroups = await this.getInstructionGroups(
        supabase,
        data.id
      );
      return normalizeRecipe({ ...data, ingredientGroups, instructionGroups });
    }

    return null;
  },

  // Get ingredient groups for a recipe
  async getIngredientGroups(
    supabase: SupabaseClient,
    recipeId: string
  ): Promise<IngredientGroup[]> {
    const { data: groups, error: groupsError } = await supabase
      .from("ingredient_groups")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("sort_order", { ascending: true });

    if (groupsError) {
      console.error("Error fetching ingredient groups:", groupsError);
      return [];
    }

    if (!groups || groups.length === 0) {
      return [];
    }

    // Fetch ingredients for each group
    const groupsWithIngredients = await Promise.all(
      groups.map(async (group) => {
        const { data: ingredients, error: ingredientsError } = await supabase
          .from("ingredients")
          .select("*")
          .eq("group_id", group.id)
          .order("sort_order", { ascending: true });

        if (ingredientsError) {
          console.error(
            "Error fetching ingredients for group:",
            ingredientsError
          );
          return {
            id: group.id,
            name: group.name,
            ingredients: [],
            sortOrder: group.sort_order,
          };
        }

        return {
          id: group.id,
          name: group.name,
          ingredients: ingredients?.map((ing) => ing.content) || [],
          sortOrder: group.sort_order,
        };
      })
    );

    return groupsWithIngredients;
  },

  // Get instruction groups for a recipe
  async getInstructionGroups(
    supabase: SupabaseClient,
    recipeId: string
  ): Promise<InstructionGroup[]> {
    const { data: groups, error: groupsError } = await supabase
      .from("instruction_groups")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("sort_order", { ascending: true });

    if (groupsError) {
      console.error("Error fetching instruction groups:", groupsError);
      return [];
    }

    if (!groups || groups.length === 0) {
      return [];
    }

    // Fetch instructions for each group
    const groupsWithInstructions = await Promise.all(
      groups.map(async (group) => {
        const { data: instructions, error: instructionsError } = await supabase
          .from("instructions")
          .select("*")
          .eq("group_id", group.id)
          .order("sort_order", { ascending: true });

        if (instructionsError) {
          console.error(
            "Error fetching instructions for group:",
            instructionsError
          );
          return {
            id: group.id,
            name: group.name,
            instructions: [],
            sortOrder: group.sort_order,
          };
        }

        return {
          id: group.id,
          name: group.name,
          instructions: instructions?.map((inst) => inst.content) || [],
          sortOrder: group.sort_order,
        };
      })
    );

    return groupsWithInstructions;
  },

  // Create a new recipe
  // Automatically sets user_id and handles admin permissions
  async createRecipe(
    supabase: SupabaseClient,
    recipe: Omit<Recipe, "id" | "createdAt" | "userId" | "slug">
  ): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const {
      prepTime,
      cookTime,
      featured,
      featuredOrder,
      ingredientGroups,
      instructionGroups,
      imagePath,
      ...rest
    } = recipe;

    // Check if user is admin for featured recipe creation
    const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    // Start a transaction
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          ...rest,
          user_id: user.id,
          prep_time: prepTime,
          cook_time: cookTime,
          ...(imagePath && { image_path: imagePath }), // Only include if imagePath exists
          featured: isAdmin && featured ? true : false,
          featured_order: isAdmin && featuredOrder ? featuredOrder : null,
          by_admin: isAdmin, // Mark if created by admin
        },
      ])
      .select()
      .single();

    if (recipeError) {
      console.error("Supabase create recipe error:", recipeError);
      throw new Error("Failed to create recipe");
    }

    // Save ingredient groups if provided
    if (ingredientGroups && ingredientGroups.length > 0) {
      await this.saveIngredientGroups(
        supabase,
        recipeData.id,
        ingredientGroups
      );
    }

    // Save instruction groups if provided
    if (instructionGroups && instructionGroups.length > 0) {
      await this.saveInstructionGroups(
        supabase,
        recipeData.id,
        instructionGroups
      );
    }

    // Fetch the complete recipe with ingredient groups
    const completeRecipe = await this.getRecipe(supabase, recipeData.id);
    return completeRecipe!;
  },

  // Save ingredient groups for a recipe
  async saveIngredientGroups(
    supabase: SupabaseClient,
    recipeId: string,
    ingredientGroups: IngredientGroup[]
  ): Promise<void> {
    // Delete existing ingredient groups and ingredients for this recipe
    await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
    await supabase.from("ingredient_groups").delete().eq("recipe_id", recipeId);

    // Insert new ingredient groups
    for (
      let groupIndex = 0;
      groupIndex < ingredientGroups.length;
      groupIndex++
    ) {
      const group = ingredientGroups[groupIndex];

      const { data: groupData, error: groupError } = await supabase
        .from("ingredient_groups")
        .insert({
          recipe_id: recipeId,
          name: group.name,
          sort_order: groupIndex,
        })
        .select()
        .single();

      if (groupError) {
        console.error("Error creating ingredient group:", groupError);
        throw new Error("Failed to create ingredient group");
      }

      // Insert ingredients for this group
      if (group.ingredients && group.ingredients.length > 0) {
        const ingredientsToInsert = group.ingredients.map(
          (ingredient, ingredientIndex) => ({
            recipe_id: recipeId,
            group_id: groupData.id,
            content: ingredient,
            sort_order: ingredientIndex,
          })
        );

        const { error: ingredientsError } = await supabase
          .from("ingredients")
          .insert(ingredientsToInsert);

        if (ingredientsError) {
          console.error("Error creating ingredients:", ingredientsError);
          throw new Error("Failed to create ingredients");
        }
      }
    }
  },

  // Save instruction groups for a recipe
  async saveInstructionGroups(
    supabase: SupabaseClient,
    recipeId: string,
    instructionGroups: InstructionGroup[]
  ): Promise<void> {
    // Delete existing instruction groups and instructions for this recipe
    await supabase.from("instructions").delete().eq("recipe_id", recipeId);
    await supabase
      .from("instruction_groups")
      .delete()
      .eq("recipe_id", recipeId);

    // Insert new instruction groups
    for (
      let groupIndex = 0;
      groupIndex < instructionGroups.length;
      groupIndex++
    ) {
      const group = instructionGroups[groupIndex];

      const { data: groupData, error: groupError } = await supabase
        .from("instruction_groups")
        .insert({
          recipe_id: recipeId,
          name: group.name,
          sort_order: groupIndex,
        })
        .select()
        .single();

      if (groupError) {
        console.error("Error creating instruction group:", groupError);
        throw new Error("Failed to create instruction group");
      }

      // Insert instructions for this group
      if (group.instructions && group.instructions.length > 0) {
        const instructionsToInsert = group.instructions.map(
          (instruction, instructionIndex) => ({
            recipe_id: recipeId,
            group_id: groupData.id,
            content: instruction,
            sort_order: instructionIndex,
          })
        );

        const { error: instructionsError } = await supabase
          .from("instructions")
          .insert(instructionsToInsert);

        if (instructionsError) {
          console.error("Error creating instructions:", instructionsError);
          throw new Error("Failed to create instructions");
        }
      }
    }
  },

  // Update a recipe
  // Only allows updates to user's own recipes or admin updates
  async updateRecipe(
    supabase: SupabaseClient,
    id: string,
    updates: Partial<Omit<Recipe, "id" | "createdAt" | "userId" | "slug">>
  ): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const {
      prepTime,
      cookTime,
      featured,
      featuredOrder,
      ingredientGroups,
      instructionGroups,
      imagePath,
      ...rest
    } = updates;
    const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    console.log("Updating recipe:", { id, updates, isAdmin });

    const { error } = await supabase
      .from("recipes")
      .update({
        ...rest,
        ...(prepTime !== undefined && { prep_time: prepTime }),
        ...(cookTime !== undefined && { cook_time: cookTime }),
        ...(imagePath && { image_path: imagePath }), // Only include if imagePath exists
        ...(featured !== undefined && isAdmin && { featured }),
        ...(featuredOrder !== undefined &&
          isAdmin && { featured_order: featuredOrder }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update recipe error:", error);
      throw new Error("Failed to update recipe");
    }

    // Update ingredient groups if provided
    if (ingredientGroups !== undefined) {
      await this.saveIngredientGroups(supabase, id, ingredientGroups);
    }

    // Update instruction groups if provided
    if (instructionGroups !== undefined) {
      await this.saveInstructionGroups(supabase, id, instructionGroups);
    }

    const normalizedRecipe = await this.getRecipe(supabase, id);
    console.log("Recipe updated in database:", normalizedRecipe);
    return normalizedRecipe!;
  },

  // Delete a recipe
  // RLS policies ensure users can only delete their own recipes
  async deleteRecipe(supabase: SupabaseClient, id: string): Promise<void> {
    // Get the recipe first to check if it has an image to delete
    // Use a try-catch to handle case where image_path column doesn't exist yet
    let recipe: { image_path?: string } | null = null;
    try {
      const { data } = await supabase
        .from("recipes")
        .select("image_path")
        .eq("id", id)
        .single();
      recipe = data;
    } catch {
      // If image_path column doesn't exist, continue without it
      console.log("image_path column not available, skipping image deletion");
    }

    // Delete ingredients, ingredient groups, instructions, and instruction groups first (cascade should handle this, but being explicit)
    await supabase.from("ingredients").delete().eq("recipe_id", id);
    await supabase.from("ingredient_groups").delete().eq("recipe_id", id);
    await supabase.from("instructions").delete().eq("recipe_id", id);
    await supabase.from("instruction_groups").delete().eq("recipe_id", id);

    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete recipe error:", error);
      throw new Error("Failed to delete recipe");
    }

    // Delete the image from storage if it exists
    if (recipe?.image_path) {
      try {
        const { error: storageError } = await supabase.storage
          .from("recipe-images")
          .remove([recipe.image_path]);

        if (storageError) {
          console.error("Error deleting image from storage:", storageError);
          // Don't throw error here as the recipe was already deleted
        }
      } catch (storageError) {
        console.error("Error deleting image from storage:", storageError);
        // Don't throw error here as the recipe was already deleted
      }
    }
  },

  // Search recipes by title, description, category, or ingredients
  async searchRecipes(
    supabase: SupabaseClient,
    query: string
  ): Promise<Recipe[]> {
    // Get user authentication status
    const { data: userData } = await supabase.auth.getUser();

    // Search for title, description, and category
    let fallbackQuery = supabase
      .from("recipes")
      .select("*")
      .or(
        [
          `title.ilike.%${query}%`,
          `description.ilike.%${query}%`,
          `category.ilike.%${query}%`,
        ].join(",")
      )
      .order("created_at", { ascending: false });

    // Apply RLS filtering for anonymous users
    if (!userData?.user) {
      fallbackQuery = fallbackQuery.or("featured.eq.true,by_admin.eq.true");
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    // Search for recipes with matching ingredients in the old array structure
    const { data: oldIngredientsMatches, error: oldIngredientsError } =
      await supabase.rpc("search_old_ingredients", { search_term: query });

    if (oldIngredientsError) {
      console.error("Old ingredients search error:", oldIngredientsError);
    }

    // Search for recipes with matching ingredients in the new grouped structure
    let ingredientQuery = supabase
      .from("ingredients")
      .select("recipe_id")
      .ilike("content", `%${query}%`);

    // Apply RLS filtering for anonymous users
    if (!userData?.user) {
      const { data: featuredRecipeIds } = await supabase
        .from("recipes")
        .select("id")
        .or("featured.eq.true,by_admin.eq.true");

      if (featuredRecipeIds && featuredRecipeIds.length > 0) {
        const ids = featuredRecipeIds.map((r) => r.id);
        ingredientQuery = ingredientQuery.in("recipe_id", ids);
      } else {
        ingredientQuery = ingredientQuery.eq(
          "recipe_id",
          "00000000-0000-0000-0000-000000000000"
        );
      }
    }

    const { data: ingredientMatches, error: ingredientError } =
      await ingredientQuery;

    if (ingredientError) {
      console.error("New ingredients search error:", ingredientError);
    }

    const ingredientRecipeIds = ingredientMatches
      ? [...new Set(ingredientMatches.map((match) => match.recipe_id))]
      : [];

    if (fallbackError) {
      console.error("Supabase search recipes fallback error:", fallbackError);
      throw new Error("Failed to search recipes (fallback)");
    }

    // Fetch full recipe data for ingredient matches
    const [oldIngredientRecipes, ingredientRecipes] = await Promise.all([
      // Fetch old ingredient matches
      oldIngredientsMatches && oldIngredientsMatches.length > 0
        ? supabase
            .from("recipes")
            .select("*")
            .in(
              "id",
              oldIngredientsMatches.map((match: { id: string }) => match.id)
            )
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
              if (error)
                console.error("Old ingredient recipes fetch error:", error);
              return data || [];
            })
        : Promise.resolve([]),

      // Fetch new ingredient matches
      ingredientRecipeIds.length > 0
        ? supabase
            .from("recipes")
            .select("*")
            .in("id", ingredientRecipeIds)
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
              if (error)
                console.error("New ingredient recipes fetch error:", error);
              return data || [];
            })
        : Promise.resolve([]),
    ]);

    // Combine all results and remove duplicates
    const allRecipes = [
      ...(fallbackData || []),
      ...oldIngredientRecipes,
      ...ingredientRecipes,
    ];
    const uniqueRecipes = allRecipes.filter(
      (recipe, index, self) =>
        index === self.findIndex((r) => r.id === recipe.id)
    );

    // Fetch ingredient groups and instruction groups for each recipe
    const recipesWithGroups = await Promise.all(
      uniqueRecipes.map(async (recipe: Recipe) => {
        const ingredientGroups = await this.getIngredientGroups(
          supabase,
          recipe.id
        );
        const instructionGroups = await this.getInstructionGroups(
          supabase,
          recipe.id
        );
        return { ...recipe, ingredientGroups, instructionGroups };
      })
    );

    return recipesWithGroups.map(normalizeRecipe);
  },

  // Get recipes by category
  // RLS policies automatically filter based on user permissions
  async getRecipesByCategory(
    supabase: SupabaseClient,
    category: string
  ): Promise<Recipe[]> {
    // Let RLS policies handle the filtering automatically
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch recipes by category");

    // Fetch ingredient groups and instruction groups for each recipe
    const recipesWithGroups = await Promise.all(
      data.map(async (recipe) => {
        const ingredientGroups = await this.getIngredientGroups(
          supabase,
          recipe.id
        );
        const instructionGroups = await this.getInstructionGroups(
          supabase,
          recipe.id
        );
        return { ...recipe, ingredientGroups, instructionGroups };
      })
    );

    return recipesWithGroups.map(normalizeRecipe);
  },

  // Admin function: Create a featured recipe (visible to everyone)
  // This should only be used by developers/admins
  async createFeaturedRecipe(
    supabase: SupabaseClient,
    recipe: Omit<Recipe, "id" | "createdAt" | "userId">
  ): Promise<Recipe> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const {
      prepTime,
      cookTime,
      ingredientGroups,
      instructionGroups,
      imagePath,
      ...rest
    } = recipe;

    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          ...rest,
          user_id: user.id,
          prep_time: prepTime,
          cook_time: cookTime,
          ...(imagePath && { image_path: imagePath }), // Only include if imagePath exists
          featured: true, // Featured recipes are visible to everyone
          by_admin: true, // Admin-created recipes are visible to everyone
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase create featured recipe error:", error);
      throw new Error("Failed to create featured recipe");
    }

    // Save ingredient groups if provided
    if (ingredientGroups && ingredientGroups.length > 0) {
      await this.saveIngredientGroups(supabase, data.id, ingredientGroups);
    }

    // Save instruction groups if provided
    if (instructionGroups && instructionGroups.length > 0) {
      await this.saveInstructionGroups(supabase, data.id, instructionGroups);
    }

    // Fetch the complete recipe with ingredient groups
    const completeRecipe = await this.getRecipe(supabase, data.id);
    return completeRecipe!;
  },
};

// Helper function to normalize database records to application format
// Converts snake_case database fields to camelCase application fields
const normalizeRecipe = (recipe: Record<string, unknown>): Recipe => ({
  id: recipe.id as string,
  userId: recipe.user_id as string,
  title: recipe.title as string,
  slug: recipe.slug as string,
  description: recipe.description as string,
  ingredients: recipe.ingredients as string[],
  ingredientGroups: recipe.ingredientGroups as IngredientGroup[],
  instructions: recipe.instructions as string[],
  instructionGroups: recipe.instructionGroups as InstructionGroup[],
  prepTime: recipe.prep_time as string,
  cookTime: recipe.cook_time as string,
  servings: recipe.servings as string,
  category: recipe.category as string,
  image: recipe.image as string,
  imagePath: (recipe.image_path as string) || undefined, // Handle case where column doesn't exist yet
  featured: recipe.featured as boolean,
  featuredOrder: recipe.featured_order as number,
  byAdmin: recipe.by_admin as boolean,
  createdAt: recipe.created_at as string,
  updatedAt: recipe.updated_at as string,
});
