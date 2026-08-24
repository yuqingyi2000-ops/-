"use client";

import { useState, useRef } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  Sparkles,
  X,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import styles from "./ai-recipe-analyzer.module.css";
import { Button } from "@khamudom/lumen-ui-react";
import { uploadImageToSupabase } from "@/lib/image-upload";

interface RecipeAnalysis {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  category: string;
  image?: string;
  imagePath?: string;
}

interface AIRecipeAnalyzerProps {
  onAnalysisComplete: (recipe: RecipeAnalysis) => void;
  onCancel: () => void;
}

export function AIRecipeAnalyzer({
  onAnalysisComplete,
  onCancel,
}: AIRecipeAnalyzerProps) {
  const [imageData, setImageData] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Please select valid image files only");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setError("Image file size must be less than 20MB");
        return;
      }
    }

    setError("");
    setAnalysisProgress("");

    // Convert files to base64
    const newImages: string[] = [];
    let processedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newImages.push(result);
        processedCount++;

        if (processedCount === files.length) {
          setImageData((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageData((prev) => prev.filter((_, i) => i !== index));
    setError("");
    setAnalysisProgress("");
  };

  const removeAllImages = () => {
    setImageData([]);
    setError("");
    setAnalysisProgress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please drop valid image files only");
      return;
    }

    // Validate file sizes
    for (const file of imageFiles) {
      if (file.size > 20 * 1024 * 1024) {
        setError("Image file size must be less than 20MB");
        return;
      }
    }

    setError("");
    setAnalysisProgress("");

    // Convert files to base64
    const newImages: string[] = [];
    let processedCount = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newImages.push(result);
        processedCount++;

        if (processedCount === imageFiles.length) {
          setImageData((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzeRecipe = async () => {
    if (imageData.length === 0) {
      setError("Please upload at least one image first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setCurrentImageIndex(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress updates
      const progressUpdates = [
        "Uploading images...",
        "Analyzing recipe content...",
        "Extracting ingredients...",
        "Processing instructions...",
        "Combining results...",
        "Finalizing recipe data...",
      ];

      let progressIndex = 0;
      progressInterval = setInterval(() => {
        if (progressIndex < progressUpdates.length - 1) {
          progressIndex++;
          setAnalysisProgress(progressUpdates[progressIndex]);

          // Update current image index for multi-image analysis
          if (imageData.length > 1 && progressIndex === 1) {
            setCurrentImageIndex(0);
          } else if (imageData.length > 1 && progressIndex > 1) {
            const imageProgress = Math.min(
              Math.floor(
                ((progressIndex - 1) / (progressUpdates.length - 2)) *
                  imageData.length
              ),
              imageData.length - 1
            );
            setCurrentImageIndex(imageProgress);
          }
        }
      }, 1000);

      const response = await fetch("/api/analyze-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific HTTP status codes with user-friendly messages
        if (response.status === 413) {
          throw new Error(
            "Image file(s) are too large. Please reduce the image size or try uploading fewer images. Each image should be under 20MB."
          );
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.recipe) {
        throw new Error("No recipe data received from AI analysis");
      }

      setAnalysisProgress("Uploading image to storage...");

      // Upload the first image to Supabase storage if we have images
      let imageUrl = data.recipe.image || "";
      let imagePath = "";

      if (imageData.length > 0) {
        try {
          // Convert base64 to file for upload
          const base64Data = imageData[0];
          const response = await fetch(base64Data);
          const blob = await response.blob();
          const file = new File([blob], `recipe-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          const uploadResult = await uploadImageToSupabase(file);

          if (uploadResult.error) {
            console.warn(
              "Failed to upload image to storage:",
              uploadResult.error
            );
            // Continue with base64 image if upload fails
          } else {
            imageUrl = uploadResult.url;
            imagePath = uploadResult.path;
          }
        } catch (uploadError) {
          console.warn("Error uploading image to storage:", uploadError);
          // Continue with base64 image if upload fails
        }
      }

      setAnalysisProgress("Analysis complete!");

      // Small delay to show completion message
      setTimeout(() => {
        onAnalysisComplete({
          ...data.recipe,
          image: imageUrl,
          imagePath: imagePath,
        });
      }, 500);
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze recipe";
      setError(errorMessage);
      console.error("Error analyzing recipe:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="outline"
          onClick={onCancel}
          icon={<ArrowLeft />}
          className={styles.cancelButton}
          aria-label="Cancel"
        />
        <h1 className={`${styles.title} page-header`}>
          <Sparkles className={styles.sparklesIcon} />
          AI Recipe Analyzer
        </h1>
      </div>

      <div className={styles.content}>
        <div className={styles.description}>
          <p>
            Upload one or more photos of a recipe (from a cookbook, handwritten
            note, or any recipe image) and our AI will automatically extract the
            recipe details for you. Multiple images will be combined
            intelligently.
          </p>
        </div>

        <div className={styles.uploadSection}>
          {/* Drag and Drop Area */}
          <div
            className={`${styles.dragDropArea} ${
              isDragOver ? styles.dragOver : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {imageData.length === 0 ? (
              <div className={styles.uploadPlaceholder}>
                <ImageIcon className={styles.uploadIcon} />
                <p>Drag & drop images here or click to browse</p>
                <span>Supports JPG, PNG, GIF up to 20MB each</span>
                <span>You can upload multiple images</span>
              </div>
            ) : (
              <div className={styles.imageGrid}>
                {imageData.map((image, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={image}
                        alt={`Recipe image ${index + 1}`}
                        fill
                        className={styles.previewImage}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      {isAnalyzing && currentImageIndex === index && (
                        <div className={styles.analyzingOverlay}>
                          <Loader2 className={styles.spinning} />
                          <span>Analyzing...</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeButton}
                      disabled={isAnalyzing}
                    >
                      <X className={styles.buttonIcon} />
                    </button>
                    <div className={styles.imageNumber}>{index + 1}</div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.addMoreButton}
                  disabled={isAnalyzing}
                >
                  <Plus className={styles.buttonIcon} />
                  Add More
                </button>
              </div>
            )}
          </div>

          <div className={styles.uploadControls}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className={styles.hiddenInput}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadButton}
              disabled={isAnalyzing}
              icon={<Upload className={styles.buttonIcon} />}
            >
              {imageData.length > 0 ? "Add More Images" : "Choose Images"}
            </Button>
            {imageData.length > 0 && (
              <Button
                variant="outline"
                onClick={removeAllImages}
                disabled={isAnalyzing}
                icon={<X className={styles.buttonIcon} />}
              >
                Clear All
              </Button>
            )}
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}
        </div>

        <div className={styles.analyzeSection}>
          <Button
            onClick={analyzeRecipe}
            disabled={imageData.length === 0 || isAnalyzing}
            className={styles.analyzeButton}
            loading={isAnalyzing}
            icon={!isAnalyzing ? <Sparkles className={styles.buttonIcon} /> : undefined}
          >
            {isAnalyzing ? "Analyzing Recipe..." : "Analyze Recipe"}
          </Button>

          {isAnalyzing && (
            <div className={styles.analyzingInfo}>
              <p>{analysisProgress}</p>
              {imageData.length > 1 && (
                <p>
                  Processing image {currentImageIndex + 1} of {imageData.length}
                </p>
              )}
              <p>
                This may take 10-30 seconds per image depending on complexity.
              </p>
            </div>
          )}
        </div>

        <div className={styles.tips}>
          <h3>Tips for best results:</h3>
          <ul>
            <li>Ensure the recipe text is clearly visible and well-lit</li>
            <li>You can upload multiple images of the same recipe</li>
            <li>
              Try to capture the entire recipe across multiple images if needed
            </li>
            <li>Handwritten recipes work best when written clearly</li>
            <li>Printed recipes from books or websites work great</li>
            <li>Make sure ingredients and instructions are readable</li>
            <li>Include the recipe title if possible</li>
            <li>Multiple images will be combined intelligently</li>
          </ul>
        </div>

        <div className={styles.pricing}>
          <h3>AI Analysis Cost:</h3>
          <p>
            Each image analysis uses OpenAI&apos;s GPT-4 Vision API and costs
            approximately $0.01-0.03 per image.
            {imageData.length > 1 && (
              <span>
                {" "}
                Total cost for {imageData.length} images: ~$
                {(imageData.length * 0.02).toFixed(2)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
