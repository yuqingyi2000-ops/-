"use client";

import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import { lottieCache, LottieAnimationData } from "@/lib/lottie-cache";
import styles from "./loading-spinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  centered?: boolean;
  animationPath?: string;
}

export function LoadingSpinner({
  size = "medium",
  text = "",
  centered = true,
  animationPath = "/assets/lottie/Animation - 1751255045745.json",
}: LoadingSpinnerProps) {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if animation is already cached
        const cached = lottieCache.getCachedAnimation(animationPath);
        if (cached) {
          setAnimationData(cached);
          setIsLoading(false);
          return;
        }

        // Load and cache the animation
        const data = await lottieCache.preloadAnimation(animationPath);
        setAnimationData(data);
        setIsLoading(false);
      } catch (err) {
        console.warn("Failed to load Lottie animation");
        setError(err instanceof Error ? err.message : "Failed to load animation");
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [animationPath]);

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return (
      <div className={`${styles.container} ${centered ? styles.centered : ""}`}>
        <div className={`${styles.spinnerContainer} ${styles[size]}`}>
          {/* Empty div to maintain layout */}
        </div>
        {text && <p className={styles.text}>{text}</p>}
      </div>
    );
  }

  // Show error state with fallback spinner
  if (error) {
    return (
      <div className={`${styles.container} ${centered ? styles.centered : ""}`}>
        <div className={`${styles.spinnerContainer} ${styles[size]}`}>
          <div className={styles.fallbackSpinner}></div>
        </div>
        {text && <p className={styles.text}>{text}</p>}
      </div>
    );
  }

  // Show Lottie animation
  return (
    <div className={`${styles.container} ${centered ? styles.centered : ""}`}>
      <div className={`${styles.spinnerContainer} ${styles[size]}`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          className={styles.animation}
        />
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
} 