/**
 * Application Constants
 *
 * This file contains all the constant values used throughout the Recipe Room application.
 * Centralizing these values here makes the app easier to maintain and ensures consistency
 * across components and features.
 *
 * Contents:
 * - Recipe categories and their associated icons
 * - UI timing constants (debounce delays)
 * - Default page content and messaging
 * - Error and success message templates
 *
 * Usage:
 * - Import specific constants as needed in components
 * - Use for consistent categorization, messaging, and UI behavior
 * - All constants are readonly to prevent accidental modification
 */

// Available recipe categories for organizing recipes
export const CATEGORIES = [
  "荤菜",
  "素菜",
  "汤",
  "主食",
  "早餐",
  "快手菜",
  "甜品",
  "饮品",
  "其他",
] as const;

// Category icon mapping for Lucide icons
// Each category has a corresponding icon for visual representation in the UI
export const CATEGORY_ICONS = {
  Appetizer: "HandPlatter",
  Breakfast: "Sun",
  Lunch: "Sandwich",
  Dinner: "CookingPot",
  "Side Dish": "Salad",
  Dessert: "CakeSlice",
  Snack: "Cookie",
  Beverage: "Wine",
} as const;

// Category slug mapping for SEO-friendly URLs
export const CATEGORY_SLUGS = {
  Appetizer: "appetizer",
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  "Side Dish": "side-dish",
  Dessert: "dessert",
  Snack: "snack",
  Beverage: "beverage",
} as const;

// Reverse mapping from slug to category name
export const CATEGORY_FROM_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([category, slug]) => [slug, category])
) as Record<string, string>;

// Debounce delay for search input to prevent excessive API calls
export const SEARCH_DEBOUNCE_DELAY = 300;

// Default content for pages when no specific content is provided
export const DEFAULT_PAGE_TITLE = "饭饭簿";
export const DEFAULT_PAGE_SUBTITLE =
  "今天也要好好吃饭呀 ♡";
export const DEFAULT_FOOTER_QUOTE = '“好好吃饭，就是最温柔的小事。”';

// Standardized error messages for consistent user feedback
export const ERROR_MESSAGES = {
  CREATE_RECIPE: "Failed to create recipe. Please try again.",
  UPDATE_RECIPE: "Failed to update recipe. Please try again.",
  DELETE_RECIPE: "Failed to delete recipe. Please try again.",
  LOAD_RECIPES: "Failed to load recipes",
  LOAD_FEATURED: "Failed to load featured recipes",
  SEARCH_RECIPES: "Failed to search recipes",
  FETCH_RECIPE: "Failed to fetch recipe. Please try again.",
} as const;

// Standardized success messages for consistent user feedback
export const SUCCESS_MESSAGES = {
  RECIPE_CREATED: "Recipe created successfully!",
  RECIPE_UPDATED: "Recipe updated successfully!",
  RECIPE_DELETED: "Recipe deleted successfully!",
} as const;
