/**
 * Lottie Animation Cache System
 *
 * This file provides a caching mechanism for Lottie animations to improve performance
 * and user experience by preloading and storing animation data in memory.
 *
 * Key Features:
 * - Preloads animations to prevent loading delays
 * - Caches animation data for instant playback
 * - Prevents duplicate loading requests
 * - Client-side only operation (SSR safe)
 * - Automatic preloading of default animations
 *
 * Benefits:
 * - Faster animation startup times
 * - Reduced network requests
 * - Better user experience with smooth animations
 * - Memory-efficient caching with cleanup options
 *
 * Usage:
 * - Import lottieCache instance
 * - Use preloadAnimation() to cache animations
 * - Use getCachedAnimation() to retrieve cached data
 * - Use isLoaded() to check if animation is cached
 */

// Lottie animation data types for TypeScript support
export interface LottieAsset {
  id: string;
  w?: number; // width
  h?: number; // height
  u?: string; // url
  p?: string; // path
  e?: number; // extension
  layers?: LottieLayer[];
  [key: string]: unknown; // Allow additional properties
}

export interface LottieLayer {
  ddd?: number; // 3D flag
  ind: number; // index
  ty: number; // type
  nm: string; // name
  sr: number; // start time
  ks: Record<string, unknown>; // keyframes
  ao: number; // auto orient
  sw: number; // stroke width
  sh: number; // stroke height
  sc: string; // stroke color
  pf: string; // path
  t: number; // time
  [key: string]: unknown; // Allow additional properties
}

export interface LottieAnimationData {
  v: string; // version
  fr: number; // frame rate
  ip: number; // in point
  op: number; // out point
  w: number; // width
  h: number; // height
  nm: string; // name
  ddd: number; // 3D flag
  assets: LottieAsset[];
  layers: LottieLayer[];
  [key: string]: unknown; // Allow additional properties that might be in Lottie files
}

// Lottie animation cache for instant loading
// Manages preloading, caching, and retrieval of animation data
class LottieCache {
  // Cache for storing loaded animation data
  private cache = new Map<string, LottieAnimationData>();
  // Track ongoing loading promises to prevent duplicate requests
  private loadingPromises = new Map<string, Promise<LottieAnimationData>>();

  // Preload an animation and cache it for future use
  async preloadAnimation(path: string): Promise<LottieAnimationData> {
    // Don't preload on server side - Lottie is client-only
    if (typeof window === "undefined") {
      return Promise.reject(
        new Error("Lottie animations can only be preloaded on the client side")
      );
    }

    // If already cached, return immediately
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // If already loading, wait for that promise to avoid duplicate requests
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // Start loading the animation
    const loadPromise = this.loadAnimation(path);
    this.loadingPromises.set(path, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(path, data);
      this.loadingPromises.delete(path);
      return data;
    } catch (error) {
      this.loadingPromises.delete(path);
      throw error;
    }
  }

  // Internal method to load animation data from a URL
  private async loadAnimation(path: string): Promise<LottieAnimationData> {
    // Only load animations on the client side
    if (typeof window === "undefined") {
      throw new Error(
        "Lottie animations can only be loaded on the client side"
      );
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load animation: ${response.statusText}`);
    }
    return response.json();
  }

  // Get cached animation data if available
  getCachedAnimation(path: string): LottieAnimationData | null {
    return this.cache.get(path) || null;
  }

  // Check if an animation is already loaded and cached
  isLoaded(path: string): boolean {
    return this.cache.has(path);
  }

  // Clear all cached animations and loading promises
  // Useful for memory management or when switching contexts
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// Global instance for use throughout the application
export const lottieCache = new LottieCache();
