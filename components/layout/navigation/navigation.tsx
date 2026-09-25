"use client";

import Link from "next/link";
import styles from "./navigation.module.css";
import Image from "next/image";

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/recipebox.png"
            alt="饭饭簿"
            width={40}
            height={40}
            priority
            sizes="50px"
            quality={90}
          />
          <div className={styles.logoText}>饭饭簿</div>
        </Link>
        <span className={styles.note}>一起收藏好好吃饭的日子</span>
      </div>
    </nav>
  );
}
