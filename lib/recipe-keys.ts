export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters: string) => [...recipeKeys.lists(), { filters }] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  featured: () => [...recipeKeys.all, "featured"] as const,
  search: (query: string) => [...recipeKeys.all, "search", query] as const,
  category: (category: string) =>
    [...recipeKeys.all, "category", category] as const,
};
