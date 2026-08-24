"use client";

import { Skeleton } from "@khamudom/lumen-ui-react";
import styles from "./loading-skeleton.module.css";

interface LoadingSkeletonProps {
  count?: number;
  type?: "recipe" | "category";
}

export function LoadingSkeleton({
  count = 3,
  type = "recipe",
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className={styles.skeleton}>
      {type === "recipe" ? (
        <>
          <Skeleton className={styles.imageSkeleton} />
          <div className={styles.contentSkeleton}>
            <Skeleton className={styles.titleSkeleton} />
            <Skeleton className={styles.descriptionSkeleton} />
            <div className={styles.metaSkeleton}>
              <Skeleton className={styles.metaItemSkeleton} />
              <Skeleton className={styles.metaItemSkeleton} />
            </div>
          </div>
        </>
      ) : (
        <Skeleton className={styles.categorySkeleton} />
      )}
    </div>
  ));

  return <div className={styles.skeletonGrid}>{skeletons}</div>;
}
